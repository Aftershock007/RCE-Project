import { useState } from "react"
import { v4 as uuid } from "uuid"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")

  const navigate = useNavigate()

  const generateRoomId = (e) => {
    e.preventDefault()
    const Id = uuid()
    setRoomId(Id)
  }

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
      return
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username
      }
    })
    toast.success("Room is created", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    })
  }

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-black md:text-2xl">
            Enter your Room ID
          </h1>
          <form className="space-y-4 md:space-y-6" action="#">
            <div className="flex flex-col items-start">
              <label
                htmlFor="roomId"
                className="block mb-2 text-sm font-medium text-black"
              >
                Room ID
              </label>
              <input
                type="text"
                name="roomId"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyUp={handleInputEnter}
                placeholder="Enter room Id"
                required
                className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>
            <div className="flex flex-col items-start">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                onKeyUp={handleInputEnter}
                placeholder="Enter username"
                required
                className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>
            <button
              onClick={joinRoom}
              className="w-full text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Join Room
            </button>
            {roomId === "" ? (
              <p className="text-sm font-light text-gray-500">
                Don’t have Room ID?{" "}
                <button
                  onClick={generateRoomId}
                  className="font-medium text-primary-600 cursor-pointer hover:underline bg-transparent border-none p-0"
                >
                  Create Room
                </button>
              </p>
            ) : (
              <span />
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
