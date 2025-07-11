"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import io, { type Socket } from "socket.io-client"
import type { RootState } from "../../slice/Store/Store"
import { setVideoCallStatus } from "../../slice/VideoCall/videoCallSlice"
import toast from "react-hot-toast"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Clock } from "lucide-react"

const VideoCall: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state: RootState) => state.user.user)
  const doctor = useSelector((state: RootState) => state.doctor.doctor)
  const isDoctorRoute = window.location.pathname.includes("/doctor")
  const userRole = isDoctorRoute ? "doctor" : "user"
  const accessToken = userRole === "doctor" ? doctor?.accessToken : user?.accessToken

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const [connected, setConnected] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [remoteStreamReceived, setRemoteStreamReceived] = useState(false)

  const queryParams = new URLSearchParams(location.search)
  const roomId = queryParams.get("roomId")
  const bookingId = queryParams.get("bookingId")

  useEffect(() => {
    if (!accessToken || !roomId || !bookingId) {
      toast.error("Invalid parameters or authentication")
      navigate("/login")
      return
    }

    const socket = io(import.meta.env.VITE_Base_Url, {
      auth: { token: accessToken, role: userRole },
      query: { bookingId, isDoctor: userRole === "doctor" },
    })
    socketRef.current = socket

    const setupMedia = async () => {
      try {
        const constraints = { video: true, audio: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setupPeerConnection(stream)
      } catch (err: any) {
        console.error("Media access error:", err)
        toast.error(
          err.name === "NotAllowedError" ? "Camera or microphone access denied" : "Could not access media devices",
        )
      }
    }

    const setupPeerConnection = (stream: MediaStream) => {
      const config: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }
      const peer = new RTCPeerConnection(config)
      peerConnectionRef.current = peer

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind)
        peer.addTrack(track, stream)
      })

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate")
          socket.emit("signal", {
            roomId,
            senderRole: userRole,
            signalData: { candidate: event.candidate },
          })
        }
      }

      // Handle remote stream
      peer.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind)
        const [remoteStream] = event.streams
        if (remoteVideoRef.current && remoteStream) {
          console.log("Setting remote stream")
          remoteVideoRef.current.srcObject = remoteStream
          setRemoteStreamReceived(true)
        }
      }

      // Handle connection state changes
      peer.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", peer.iceConnectionState)
        if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
          setConnected(true)
          dispatch(setVideoCallStatus("connected"))
        } else if (peer.iceConnectionState === "disconnected" || peer.iceConnectionState === "failed") {
          setConnected(false)
          setRemoteStreamReceived(false)
          toast.error("Connection lost")
        }
      }

      // Handle signaling data
      socket.on("signal", async (data) => {
        console.log("Received signal:", data.signalData)
        if (data.senderRole === userRole) return

        try {
          if (data.signalData.sdp) {
            console.log("Received SDP:", data.signalData.sdp.type)
            await peer.setRemoteDescription(new RTCSessionDescription(data.signalData.sdp))

            if (data.signalData.sdp.type === "offer") {
              console.log("Creating answer")
              const answer = await peer.createAnswer()
              await peer.setLocalDescription(answer)
              socket.emit("signal", {
                roomId,
                senderRole: userRole,
                signalData: { sdp: answer },
              })
            }
          } else if (data.signalData.candidate) {
            console.log("Adding ICE candidate")
            await peer.addIceCandidate(new RTCIceCandidate(data.signalData.candidate))
          }
        } catch (error) {
          console.error("Error handling signal:", error)
        }
      })

      // Handle negotiation needed - both sides can initiate
      peer.onnegotiationneeded = async () => {
        try {
          console.log("Negotiation needed, creating offer")
          const offer = await peer.createOffer()
          await peer.setLocalDescription(offer)
          socket.emit("signal", {
            roomId,
            senderRole: userRole,
            signalData: { sdp: offer },
          })
        } catch (error) {
          console.error("Error creating offer:", error)
        }
      }

      // Join the video call room
      socket.emit("joinVideoCall", { roomId, bookingId })

      // Additional fallback for offer creation
      setTimeout(async () => {
        if (peer.signalingState === "stable" && !peer.remoteDescription) {
          console.log("Fallback: Creating offer after timeout")
          try {
            const offer = await peer.createOffer()
            await peer.setLocalDescription(offer)
            socket.emit("signal", {
              roomId,
              senderRole: userRole,
              signalData: { sdp: offer },
            })
          } catch (error) {
            console.error("Error creating fallback offer:", error)
          }
        }
      }, 2000)
    }

    setupMedia()

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
        localStreamRef.current = null
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [accessToken, bookingId, dispatch, navigate, roomId, userRole])

  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [connected])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "m") toggleAudio()
      if (e.key === "v") toggleVideo()
      if (e.key === "e") endCall()
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const endCall = () => {
    navigate(userRole === "doctor" ? "/doctor/home" : "/")
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
        setIsAudioMuted(!track.enabled)
      })
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
        setIsVideoOff(!track.enabled)
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Video Call
            <span className="ml-3 text-lg font-medium text-purple-200 capitalize bg-purple-500/20 px-3 py-1 rounded-full">
              {userRole}
            </span>
          </h1>
        </div>

        {/* Status and Duration */}
        <div className="flex items-center gap-6 mb-8">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md border transition-all duration-500 shadow-lg ${
              connected
                ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300 shadow-emerald-500/20"
                : "bg-red-500/20 border-red-400/30 text-red-300 shadow-red-500/20"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400 animate-bounce"}`}
            ></div>
            <span className="text-sm font-semibold tracking-wide">{connected ? "Connected" : "Connecting..."}</span>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-mono text-lg font-semibold tracking-wider">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          {/* Local Video */}
          <div className="group relative transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Video Label */}
              <div className="absolute top-6 left-6 z-20">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                  <span className="text-white text-sm font-semibold tracking-wide">You</span>
                </div>
              </div>

              <div className="relative aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-3xl"
                  aria-label="Local video feed"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
                        <span className="text-3xl font-bold text-white">{user?.name?.[0]?.toUpperCase() || "U"}</span>
                      </div>
                      <p className="text-gray-300 text-lg font-medium">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              <div className="absolute bottom-6 right-6 flex gap-3">
                {isAudioMuted && (
                  <div className="p-3 bg-red-500/90 backdrop-blur-md rounded-xl shadow-lg border border-red-400/30">
                    <MicOff className="w-5 h-5 text-white" />
                  </div>
                )}
                {isVideoOff && (
                  <div className="p-3 bg-red-500/90 backdrop-blur-md rounded-xl shadow-lg border border-red-400/30">
                    <VideoOff className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remote Video */}
          <div className="group relative transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Video Label */}
              <div className="absolute top-6 left-6 z-20">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                  <span className="text-white text-sm font-semibold tracking-wide">
                    {userRole === "doctor" ? "Patient" : "Doctor"}
                  </span>
                </div>
              </div>

              <div className="relative aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover rounded-3xl ${remoteStreamReceived ? "block" : "hidden"}`}
                  aria-label="Remote video feed"
                />
                {/* Waiting State - Only show when no remote stream */}
                {!remoteStreamReceived && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl animate-pulse">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-gray-300 text-lg font-medium">
                        {connected ? "Waiting for video..." : "Waiting for connection..."}
                      </p>
                      <div className="flex justify-center mt-4">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="relative z-10 pb-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-6 p-6 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
              className={`group relative p-5 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                isAudioMuted
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 border border-red-400/50"
                  : "bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50"
              }`}
            >
              {isAudioMuted ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                {isAudioMuted ? "Unmute (M)" : "Mute (M)"}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
              className={`group relative p-5 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 border border-red-400/50"
                  : "bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50"
              }`}
            >
              {isVideoOff ? <VideoOff className="w-7 h-7 text-white" /> : <Video className="w-7 h-7 text-white" />}
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                {isVideoOff ? "Turn Video On (V)" : "Turn Video Off (V)"}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              aria-label="End video call"
              className="group relative p-5 bg-red-500 hover:bg-red-600 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-500/30 border border-red-400/50"
            >
              <PhoneOff className="w-7 h-7 text-white" />
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                End Call (E)
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-white/80 text-sm font-medium">Keyboard shortcuts:</span>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20">
                M
              </kbd>
              <span className="text-white/60 text-xs">Mute</span>
              <kbd className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20">
                V
              </kbd>
              <span className="text-white/60 text-xs">Video</span>
              <kbd className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20">
                E
              </kbd>
              <span className="text-white/60 text-xs">End</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCall





// import React, { useEffect, useRef, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import io, { Socket } from "socket.io-client";
// import { RootState } from "../../slice/Store/Store";
// import { setVideoCallStatus } from "../../slice/VideoCall/videoCallSlice";
// import toast from "react-hot-toast";
// import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

// const VideoCall: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const user = useSelector((state: RootState) => state.user.user);
//   const doctor = useSelector((state: RootState) => state.doctor.doctor);
//   const isDoctorRoute = window.location.pathname.includes("/doctor");
//   const userRole = isDoctorRoute ? "doctor" : "user";
//   const accessToken =
//     userRole === "doctor" ? doctor?.accessToken : user?.accessToken;

//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   const [connected, setConnected] = useState(false);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);

//   const queryParams = new URLSearchParams(location.search);
//   const roomId = queryParams.get("roomId");
//   const bookingId = queryParams.get("bookingId");

//   useEffect(() => {
//     if (!accessToken || !roomId || !bookingId) {
//       toast.error("Invalid parameters or authentication");
//       navigate("/login");
//       return;
//     }

//     const socket = io(
//       import.meta.env.VITE_Base_Url,
//       {
//         auth: { token: accessToken, role: userRole },
//         query: { bookingId, isDoctor: userRole === "doctor" },
//       }
//     );

//     socketRef.current = socket;

//     const setupMedia = async () => {
//       try {
//         const constraints = { video: true, audio: true };
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         localStreamRef.current = stream;
//         if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//         setupPeerConnection(stream);
//       } catch (err: any) {
//         console.error("Media access error:", err);
//         toast.error(
//           err.name === "NotAllowedError"
//             ? "Camera or microphone access denied"
//             : "Could not access media devices"
//         );
//       }
//     };

//     const setupPeerConnection = (stream: MediaStream) => {
//       const config: RTCConfiguration = {
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       };

//       const peer = new RTCPeerConnection(config);
//       peerConnectionRef.current = peer;

//       stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//       peer.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("signal", {
//             roomId,
//             senderRole: userRole,
//             signalData: { candidate: event.candidate },
//           });
//         }
//       };

//       peer.ontrack = (event) => {
//         const [remoteStream] = event.streams;
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStream;
//         }
//       };

//       peer.oniceconnectionstatechange = () => {
//         console.log("ICE Connection State:", peer.iceConnectionState);
//         if (peer.iceConnectionState === "connected") {
//           setConnected(true);
//           dispatch(setVideoCallStatus("connected"));
//         } else if (peer.iceConnectionState === "disconnected") {
//           setConnected(false);
//           toast.error("Connection lost");
//         }
//       };

//       socket.on("signal", async (data) => {
//         if (data.senderRole === userRole) return;

//         if (data.signalData.sdp) {
//           await peer.setRemoteDescription(
//             new RTCSessionDescription(data.signalData.sdp)
//           );
//           if (data.signalData.sdp.type === "offer") {
//             const answer = await peer.createAnswer();
//             await peer.setLocalDescription(answer);
//             socket.emit("signal", {
//               roomId,
//               senderRole: userRole,
//               signalData: { sdp: answer },
//             });
//           }
//         } else if (data.signalData.candidate) {
//           try {
//             await peer.addIceCandidate(
//               new RTCIceCandidate(data.signalData.candidate)
//             );
//           } catch (e) {
//             console.error("Error adding ICE candidate", e);
//           }
//         }
//       });

//       // 🔁 Ensure both sides can initiate
//       const createOffer = async () => {
//         const offer = await peer.createOffer();
//         await peer.setLocalDescription(offer);
//         socket.emit("signal", {
//           roomId,
//           senderRole: userRole,
//           signalData: { sdp: offer },
//         });
//       };

//       if (userRole === "doctor") {
//         peer.onnegotiationneeded = () => createOffer();
//       } else {
//         // 🔁 Fallback: try sending offer manually if user
//         setTimeout(() => {
//           if (peer.signalingState === "stable" && !peer.remoteDescription) {
//             createOffer();
//           }
//         }, 1500);
//       }

//       socket.emit("joinVideoCall", { roomId, bookingId });
//     };

//     // const setupPeerConnection = (stream: MediaStream) => {
//     //   const config: RTCConfiguration = {
//     //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     //   };

//     //   const peer = new RTCPeerConnection(config);
//     //   peerConnectionRef.current = peer;

//     //   stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//     //   peer.onicecandidate = (event) => {
//     //     if (event.candidate) {
//     //       socket.emit("signal", {
//     //         roomId,
//     //         senderRole: userRole,
//     //         signalData: { candidate: event.candidate },
//     //       });
//     //     }
//     //   };

//     //   peer.ontrack = (event) => {
//     //     const [remoteStream] = event.streams;
//     //     if (remoteVideoRef.current) {
//     //       remoteVideoRef.current.srcObject = remoteStream;
//     //     }
//     //   };

//     //   peer.oniceconnectionstatechange = () => {
//     //     console.log("ICE Connection State:", peer.iceConnectionState);
//     //     if (peer.iceConnectionState === "connected") {
//     //       setConnected(true);
//     //       dispatch(setVideoCallStatus("connected"));
//     //     } else if (peer.iceConnectionState === "disconnected") {
//     //       setConnected(false);
//     //       toast.error("Connection lost");
//     //     }
//     //   };

//     //   socket.on("signal", async (data) => {
//     //     if (data.senderRole === userRole) return;

//     //     if (data.signalData.sdp) {
//     //       await peer.setRemoteDescription(new RTCSessionDescription(data.signalData.sdp));
//     //       if (data.signalData.sdp.type === "offer") {
//     //         const answer = await peer.createAnswer();
//     //         await peer.setLocalDescription(answer);
//     //         socket.emit("signal", {
//     //           roomId,
//     //           senderRole: userRole,
//     //           signalData: { sdp: answer },
//     //         });
//     //       }
//     //     } else if (data.signalData.candidate) {
//     //       try {
//     //         await peer.addIceCandidate(new RTCIceCandidate(data.signalData.candidate));
//     //       } catch (e) {
//     //         console.error("Error adding ICE candidate", e);
//     //       }
//     //     }
//     //   });

//     //   if (userRole === "doctor") {
//     //     peer.onnegotiationneeded = async () => {
//     //       const offer = await peer.createOffer();
//     //       await peer.setLocalDescription(offer);
//     //       socket.emit("signal", {
//     //         roomId,
//     //         senderRole: userRole,
//     //         signalData: { sdp: offer },
//     //       });
//     //     };
//     //   }

//     //   socket.emit("joinVideoCall", { roomId, bookingId });
//     // };

//     setupMedia();

//     return () => {
//       peerConnectionRef.current?.close();
//       peerConnectionRef.current = null;

//       localStreamRef.current?.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;

//       socketRef.current?.disconnect();
//       socketRef.current = null;
//     };
//   }, [accessToken, bookingId, dispatch, navigate, roomId, userRole]);

//   useEffect(() => {
//     if (connected) {
//       const interval = setInterval(
//         () => setCallDuration((prev) => prev + 1),
//         1000
//       );
//       return () => clearInterval(interval);
//     }
//   }, [connected]);

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key === "m") toggleAudio();
//       if (e.key === "v") toggleVideo();
//       if (e.key === "e") endCall();
//     };
//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, []);

//   const endCall = () => {
//     navigate(userRole === "doctor" ? "/doctor/home" : "/");
//   };

//   const toggleAudio = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getAudioTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//         setIsAudioMuted(!track.enabled);
//       });
//     }
//   };

//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getVideoTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//         setIsVideoOff(!track.enabled);
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-all duration-300">
//       <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
//         Video Call ({userRole})
//       </h2>
//       <div
//         className={`text-sm font-medium mb-4 ${
//           connected ? "text-green-500" : "text-red-500"
//         } animate-pulse`}
//       >
//         {connected ? "Connected" : "Connecting..."}
//       </div>
//       <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
//         Call Duration: {Math.floor(callDuration / 60)}:
//         {(callDuration % 60).toString().padStart(2, "0")}
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 animate-fade-in">
//           <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"></h3>
//           <div className="relative">
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full rounded-xl bg-black"
//               aria-label="Local video feed"
//             />
//             {isVideoOff && (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
//                 <span className="text-4xl font-bold text-white">
//                   {user?.name?.[0] || "U"}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 animate-fade-in">
//           <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"></h3>
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-full rounded-xl bg-black"
//             aria-label="Remote video feed"
//           />
//         </div>
//       </div>
//       <div className="mt-8 flex flex-wrap gap-4 justify-center">
//         <button
//           onClick={toggleAudio}
//           aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
//           className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
//         >
//           {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
//           {isAudioMuted ? "Unmute" : "Mute"}
//         </button>
//         <button
//           onClick={toggleVideo}
//           aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
//           className="flex items-center gap-2 px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-full shadow-lg focus:ring-2 focus:ring-purple-500 transition duration-300"
//         >
//           {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
//           {isVideoOff ? "Turn Video On" : "Turn Video Off"}
//         </button>
//         <button
//           onClick={endCall}
//           aria-label="End video call"
//           className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg focus:ring-2 focus:ring-red-500 transition duration-300"
//         >
//           <PhoneOff size={20} />
//           End Call
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;
