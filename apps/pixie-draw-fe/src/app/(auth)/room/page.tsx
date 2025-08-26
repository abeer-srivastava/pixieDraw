"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Feather } from "lucide-react";
import { useEffect, useState } from "react";
import { HTTP_BACKEND } from "../../../../config";
import { useRouter } from "next/navigation";

function Room() {
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router=useRouter()
  // Get token from localStorage when component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

 const handleCreateRoom = async () => {
  if (!roomName) {
    alert("Please enter a Room Name");
    return;
  }

//   console.log("Joining room:", roomName);
//   console.log("Using token:", token);

  try {
    const res = await axios.post(
      `${HTTP_BACKEND}/room`,
      { roomName }, // body
      {
        headers: {
          authorization:token,
        },
      }
    );

    // console.log("roomId is this ", res.data.message);
    // console.log("roomId is this ", res.data.id);
    router.replace(`/canvas/${res.data.id}`);
  } catch (err) {
    console.error("Error Creating room:", err);
  }
};

const handleJoinRoom = async () => {
  if (!roomName) {
    alert("Please enter a Room Name");
    return;
  }

  try {
    const res = await axios.get(`${HTTP_BACKEND}/room/${roomName}`,{
        headers: {
          authorization:token,
        },
      });


    const roomId=res.data.roomId
    console.log(JSON.stringify(roomId));
    router.replace(`/canvas/${roomId}`);
  } catch (err) {
    console.error("Error joining room:", err);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center text-neutral-100">
    <div className="flex flex-col items-center space-y-4 w-full max-w-md p-6 rounded-2xl bg-[#332351] border border-black shadow-lg">
     <div className="flex flex-row justify-center items-center ">
        <Feather
              size={30}
              className="mr-2 bg-[#a78bfa] text-black border-2 border-black rounded-lg p-1"
        />
        <h2 className="text-xl font-semibold ">Join a Room</h2>
     </div>
      
      <Input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Enter Room ID"
        className="border rounded p-2 w-64 bg-neutral-800 border-neutral-700 text-neutral-100"
      />

<div className="flex flex-col w-full ">
      <Button
        onClick={handleCreateRoom}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white m-2 w-full"
      >
        Create Room
      </Button>
       <Button
        onClick={handleJoinRoom}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white m-2 w-full"
      >
        Join Room
      </Button>
</div>
    </div>
    </div>
  );
}

export default Room;
