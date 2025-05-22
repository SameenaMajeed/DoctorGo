import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCalling: boolean;
  isReceivingCall: boolean;
  callData: CallOffer | null;
  startCall: () => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  rejectCall: () => void;
}

interface CallOffer {
  userId: string;
  doctorId: string;
  offer: RTCSessionDescriptionInit;
  callerRole: "user" | "doctor";
  callerName: string;
}

interface CallAnswer {
  userId: string;
  doctorId: string;
  answer: RTCSessionDescriptionInit;
}

interface ICECandidate {
  userId: string;
  doctorId: string;
  candidate: RTCIceCandidate;
}

export const useWebRTC = (
  socket: Socket | null,
  userId: string,
  doctorId: string,
  role: "user" | "doctor",
  name: string
): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callData, setCallData] = useState<CallOffer | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const callDataRef = useRef<CallOffer | null>(null);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ICECandidate", {
          userId,
          doctorId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const newRemoteStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        newRemoteStream.addTrack(track);
      });
      setRemoteStream(newRemoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected") {
        endCall();
      }
    };

    return pc;
  };

  // Start a call
  const startCall = async () => {
    if (!socket || !userId || !doctorId) return;

    try {
      setIsCalling(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      peerConnection.current = createPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("callUser", {
        userId,
        doctorId,
        offer,
        callerRole: role,
        callerName: name,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      endCall();
    }
  };

  // Answer a call
  const answerCall = async () => {
    if (!socket || !callDataRef.current || !peerConnection.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(callDataRef.current.offer)
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answerCall", {
        userId: callDataRef.current.userId,
        doctorId: callDataRef.current.doctorId,
        answer,
      });

      setIsReceivingCall(false);
    } catch (error) {
      console.error("Error answering call:", error);
      endCall();
    }
  };

  // End the call
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsCalling(false);
    setIsReceivingCall(false);
    setCallData(null);
    callDataRef.current = null;

    if (socket && userId && doctorId) {
      socket.emit("endCall", { userId, doctorId });
    }
  };

  // Reject the call
  const rejectCall = () => {
    if (socket && callDataRef.current) {
      socket.emit("rejectCall", {
        userId: callDataRef.current.userId,
        doctorId: callDataRef.current.doctorId,
      });
    }
    setIsReceivingCall(false);
    setCallData(null);
    callDataRef.current = null;
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallReceived = (data: CallOffer) => {
      if (
        (role === "user" && data.userId !== userId) ||
        (role === "doctor" && data.doctorId !== doctorId)
      ) {
        return;
      }

      peerConnection.current = createPeerConnection();
      setCallData(data);
      callDataRef.current = data;
      setIsReceivingCall(true);
    };

    const handleCallAnswered = async (data: CallAnswer) => {
      if (
        !peerConnection.current ||
        (role === "user" && data.userId !== userId) ||
        (role === "doctor" && data.doctorId !== doctorId)
      ) {
        return;
      }

      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setIsCalling(false);
      } catch (error) {
        console.error("Error setting remote description:", error);
        endCall();
      }
    };

    const handleICECandidate = async (data: ICECandidate) => {
      if (
        !peerConnection.current ||
        (role === "user" && data.userId !== userId) ||
        (role === "doctor" && data.doctorId !== doctorId)
      ) {
        return;
      }

      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    const handleCallRejected = () => {
      if (isCalling) {
        alert("Call was rejected");
        endCall();
      }
    };

    socket.on("callReceived", handleCallReceived);
    socket.on("callAnswered", handleCallAnswered);
    socket.on("ICECandidate", handleICECandidate);
    socket.on("callEnded", handleCallEnded);
    socket.on("callRejected", handleCallRejected);

    return () => {
      socket.off("callReceived", handleCallReceived);
      socket.off("callAnswered", handleCallAnswered);
      socket.off("ICECandidate", handleICECandidate);
      socket.off("callEnded", handleCallEnded);
      socket.off("callRejected", handleCallRejected);
      endCall();
    };
  }, [socket, userId, doctorId, role, isCalling]);

  return {
    localStream,
    remoteStream,
    isCalling,
    isReceivingCall,
    callData,
    startCall,
    answerCall,
    endCall,
    rejectCall,
  };
};