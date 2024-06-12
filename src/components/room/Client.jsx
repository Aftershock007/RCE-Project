import PropTypes from "prop-types"
import Avatar from "react-avatar"

export default function Client({ username }) {
  return (
    <div className="flex flex-row align-center space-x-2 mb-1">
      <Avatar name={username.toString()} size={40} round="100px" />
      <span className="m-auto">
        {username.toString().substring(0, 13) +
          (username.toString().length > 8 ? "..." : "")}
      </span>
    </div>
  )
}

Client.propTypes = {
  username: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}
