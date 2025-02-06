import React from 'react'

const DartsUsersDialogCompare = ({ title, firstData, secondData }) => {
  const handleColor = (firstData, seconData) => {
    if (firstData > secondData) return "text-red-500";
    else if (firstData < secondData) return "text-blue-500"
    else if (firstData === secondData) return "text-green";
  }

  return (
    <span>
      {title}: {firstData}
      <span className={handleColor(firstData, secondData)}> ={'>'} </span>
      {secondData}
    </span>
  )
}

export default DartsUsersDialogCompare