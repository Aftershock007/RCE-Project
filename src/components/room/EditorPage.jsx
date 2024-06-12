import { useEffect, useRef, useState } from "react"
import Client from "./Client"
import Landing from "../ide/Landing"
import { initSocket } from "../../Socket"
import { ACTIONS } from "../../Actions"
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "react-toastify"

export default function EditorPage() {
  const [clients, setClients] = useState([])
  const codeRef = useRef(null)
  const Location = useLocation()
  const navigate = useNavigate()
  const { roomId } = useParams()
  const socketRef = useRef(null)

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success(`Room Id is copied`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
    } catch (error) {
      console.log(error)
      toast.error(`Unable to copy the room Id`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
    }
  }

  const debouncedCopyRoomId = useDebouncedCallback(copyRoomId, 500)

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket()
      socketRef.current.on("connect_error", (err) => handleErrors(err))
      socketRef.current.on("connect_failed", (err) => handleErrors(err))
      const handleErrors = (err) => {
        console.log("Error", err)
        toast.error(`Socket connection failed, Try again later`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
        navigate("/")
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username
      })
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room`, {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          }
          const uniqueNames = new Set()
          const uniqueNameElements = clients.filter((obj) => {
            if (!uniqueNames.has(obj.username)) {
              uniqueNames.add(obj.username)
              return true
            }
            return false
          })
          setClients(uniqueNameElements)
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          })
        }
      )
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.error(`${username} left the room`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId)
        })
      })
    }
    init()
    return () => {
      socketRef?.current?.disconnect()
      socketRef.current.off(ACTIONS.JOINED)
      socketRef.current.off(ACTIONS.DISCONNECTED)
    }
  }, [])

  if (!Location.state) {
    return <Navigate to="/" />
  }

  const leaveRoom = async () => {
    navigate("/")
  }

  return (
    <div className="flex flex-row h-screen max-h-screen bg-[#B9F3FC]">
      <div className="flex flex-col bg-white border-r-2 shadow-[4px_0px_0px_0px_rgba(0,0,0)] hover:shadow transition duration-200 border-black rounded-r-lg z-10">
        <div className="my-3 mb-4 font-bold mx-auto text-xl">Members</div>
        <div className="flex-grow overflow-auto ml-2">
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
        <div className="flex flex-col w-40 ml-2 mb-1">
          <button
            type="button"
            onClick={debouncedCopyRoomId}
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Copy Room ID
          </button>
          <button
            type="button"
            onClick={leaveRoom}
            className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Leave Room
          </button>
        </div>
      </div>
      <div className="w-full">
        <Landing roomId={roomId} socketRef={socketRef} />
      </div>
    </div>
  )
}
