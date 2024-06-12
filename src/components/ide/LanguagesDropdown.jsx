import PropTypes from "prop-types"
import Select from "react-select"
import { customStyles } from "../../constants/customStyles"
import { languageOptions } from "../../constants/languageOptions"

export default function LanguagesDropdown({ onSelectChange }) {
  return (
    <Select
      placeholder={`Filter By Category`}
      options={languageOptions}
      styles={customStyles}
      defaultValue={languageOptions[0]}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
    />
  )
}

LanguagesDropdown.propTypes = {
  onSelectChange: PropTypes.func.isRequired
}
