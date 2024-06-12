import PropTypes from "prop-types"

export default function OutputWindow({ outputDetails }) {
  const getOutput = () => {
    const statusId = outputDetails?.status?.id
    if (statusId === 6) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.compile_output)}
        </pre>
      )
    } else if (statusId === 3) {
      return (
        <pre className="px-1.5 py-1 font-normal text-xs text-black">
          {atob(outputDetails.stdout) !== null
            ? `${atob(outputDetails.stdout)}`
            : null}
        </pre>
      )
    } else if (statusId === 5) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          Time Limit Exceeded
        </pre>
      )
    } else {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.stderr)}
        </pre>
      )
    }
  }

  return (
    <>
      <h1 className="font-bold text-xl bg-clip-text">Output</h1>
      <div className="focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-3 py-2 hover:shadow transition duration-200 bg-white mt-2 h-56">
        {outputDetails ? <>{getOutput()}</> : null}
      </div>
    </>
  )
}

OutputWindow.propTypes = {
  outputDetails: PropTypes.shape({
    status: PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired
    }).isRequired,
    compile_output: PropTypes.string,
    stdout: PropTypes.string,
    stderr: PropTypes.string
  })
}
