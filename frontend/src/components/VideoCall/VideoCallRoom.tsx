import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { RootState } from "../../slice/Store/Store";
import { setVideoCallStatus } from "../../slice/VideoCall/videoCallSlice";
import toast from "react-hot-toast";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const VideoCall: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.user.user);
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const isDoctorRoute = window.location.pathname.includes("/doctor");
  const userRole = isDoctorRoute ? "doctor" : "user";
  const accessToken =
    userRole === "doctor" ? doctor?.accessToken : user?.accessToken;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [connected, setConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("roomId");
  const bookingId = queryParams.get("bookingId");

  useEffect(() => {
    if (!accessToken || !roomId || !bookingId) {
      toast.error("Invalid parameters or authentication");
      navigate("/login");
      return;
    }

    const socket = io(
      import.meta.env.VITE_Base_Url,
      {
        auth: { token: accessToken, role: userRole },
        query: { bookingId, isDoctor: userRole === "doctor" },
      }
    );

    socketRef.current = socket;

    const setupMedia = async () => {
      try {
        const constraints = { video: true, audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setupPeerConnection(stream);
      } catch (err: any) {
        console.error("Media access error:", err);
        toast.error(
          err.name === "NotAllowedError"
            ? "Camera or microphone access denied"
            : "Could not access media devices"
        );
      }
    };

    const setupPeerConnection = (stream: MediaStream) => {
      const config: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };

      const peer = new RTCPeerConnection(config);
      peerConnectionRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", {
            roomId,
            senderRole: userRole,
            signalData: { candidate: event.candidate },
          });
        }
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", peer.iceConnectionState);
        if (peer.iceConnectionState === "connected") {
          setConnected(true);
          dispatch(setVideoCallStatus("connected"));
        } else if (peer.iceConnectionState === "disconnected") {
          setConnected(false);
          toast.error("Connection lost");
        }
      };

      socket.on("signal", async (data) => {
        if (data.senderRole === userRole) return;

        if (data.signalData.sdp) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.signalData.sdp)
          );
          if (data.signalData.sdp.type === "offer") {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("signal", {
              roomId,
              senderRole: userRole,
              signalData: { sdp: answer },
            });
          }
        } else if (data.signalData.candidate) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(data.signalData.candidate)
            );
          } catch (e) {
            console.error("Error adding ICE candidate", e);
          }
        }
      });

      // 🔁 Ensure both sides can initiate
      const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("signal", {
          roomId,
          senderRole: userRole,
          signalData: { sdp: offer },
        });
      };

      if (userRole === "doctor") {
        peer.onnegotiationneeded = () => createOffer();
      } else {
        // 🔁 Fallback: try sending offer manually if user
        setTimeout(() => {
          if (peer.signalingState === "stable" && !peer.remoteDescription) {
            createOffer();
          }
        }, 1500);
      }

      socket.emit("joinVideoCall", { roomId, bookingId });
    };

    // const setupPeerConnection = (stream: MediaStream) => {
    //   const config: RTCConfiguration = {
    //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    //   };

    //   const peer = new RTCPeerConnection(config);
    //   peerConnectionRef.current = peer;

    //   stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    //   peer.onicecandidate = (event) => {
    //     if (event.candidate) {
    //       socket.emit("signal", {
    //         roomId,
    //         senderRole: userRole,
    //         signalData: { candidate: event.candidate },
    //       });
    //     }
    //   };

    //   peer.ontrack = (event) => {
    //     const [remoteStream] = event.streams;
    //     if (remoteVideoRef.current) {
    //       remoteVideoRef.current.srcObject = remoteStream;
    //     }
    //   };

    //   peer.oniceconnectionstatechange = () => {
    //     console.log("ICE Connection State:", peer.iceConnectionState);
    //     if (peer.iceConnectionState === "connected") {
    //       setConnected(true);
    //       dispatch(setVideoCallStatus("connected"));
    //     } else if (peer.iceConnectionState === "disconnected") {
    //       setConnected(false);
    //       toast.error("Connection lost");
    //     }
    //   };

    //   socket.on("signal", async (data) => {
    //     if (data.senderRole === userRole) return;

    //     if (data.signalData.sdp) {
    //       await peer.setRemoteDescription(new RTCSessionDescription(data.signalData.sdp));
    //       if (data.signalData.sdp.type === "offer") {
    //         const answer = await peer.createAnswer();
    //         await peer.setLocalDescription(answer);
    //         socket.emit("signal", {
    //           roomId,
    //           senderRole: userRole,
    //           signalData: { sdp: answer },
    //         });
    //       }
    //     } else if (data.signalData.candidate) {
    //       try {
    //         await peer.addIceCandidate(new RTCIceCandidate(data.signalData.candidate));
    //       } catch (e) {
    //         console.error("Error adding ICE candidate", e);
    //       }
    //     }
    //   });

    //   if (userRole === "doctor") {
    //     peer.onnegotiationneeded = async () => {
    //       const offer = await peer.createOffer();
    //       await peer.setLocalDescription(offer);
    //       socket.emit("signal", {
    //         roomId,
    //         senderRole: userRole,
    //         signalData: { sdp: offer },
    //       });
    //     };
    //   }

    //   socket.emit("joinVideoCall", { roomId, bookingId });
    // };

    setupMedia();

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;

      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, bookingId, dispatch, navigate, roomId, userRole]);

  useEffect(() => {
    if (connected) {
      const interval = setInterval(
        () => setCallDuration((prev) => prev + 1),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [connected]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "m") toggleAudio();
      if (e.key === "v") toggleVideo();
      if (e.key === "e") endCall();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const endCall = () => {
    navigate(userRole === "doctor" ? "/doctor/home" : "/");
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-all duration-300">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Video Call ({userRole})
      </h2>
      <div
        className={`text-sm font-medium mb-4 ${
          connected ? "text-green-500" : "text-red-500"
        } animate-pulse`}
      >
        {connected ? "Connected" : "Connecting..."}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Call Duration: {Math.floor(callDuration / 60)}:
        {(callDuration % 60).toString().padStart(2, "0")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"></h3>
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-xl bg-black"
              aria-label="Local video feed"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
                <span className="text-4xl font-bold text-white">
                  {user?.name?.[0] || "U"}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"></h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black"
            aria-label="Remote video feed"
          />
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={toggleAudio}
          aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
          className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          {isAudioMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={toggleVideo}
          aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
          className="flex items-center gap-2 px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-full shadow-lg focus:ring-2 focus:ring-purple-500 transition duration-300"
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
        <button
          onClick={endCall}
          aria-label="End video call"
          className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg focus:ring-2 focus:ring-red-500 transition duration-300"
        >
          <PhoneOff size={20} />
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
