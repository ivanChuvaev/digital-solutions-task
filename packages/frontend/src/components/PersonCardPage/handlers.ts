export const dragStartHandler = (
  event: React.DragEvent<HTMLLIElement>,
  personId: number,
  draggingClassName: string,
) => {
  event.currentTarget.classList.add(draggingClassName)
  event.dataTransfer.setData('text/plain', JSON.stringify(personId))
  event.dataTransfer.effectAllowed = 'move'
}

export const dragOverHandler = (event: React.DragEvent<HTMLLIElement>) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

export const dropHandler = (
  event: React.DragEvent<HTMLLIElement>,
  personId: number,
  draggedOverClassName: string,
  callback?: (aPersonId: number, bPersonId: number) => void,
) => {
  event.preventDefault()
  event.currentTarget.classList.remove(draggedOverClassName)
  const transferredPersonId = parseInt(event.dataTransfer.getData('text/plain'))
  if (
    callback &&
    !Number.isNaN(transferredPersonId) &&
    transferredPersonId !== personId
  ) {
    callback(transferredPersonId, personId)
  }
}

export const dragEnterHandler = (
  event: React.DragEvent<HTMLLIElement>,
  draggedOverClassName: string,
) => {
  event.currentTarget.classList.add(draggedOverClassName)
}

export const dragLeaveHandler = (
  event: React.DragEvent<HTMLLIElement>,
  draggedOverClassName: string,
) => {
  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
    event.currentTarget.classList.remove(draggedOverClassName)
  }
}

export const dragEndHandler = (
  event: React.DragEvent<HTMLLIElement>,
  draggingClassName: string,
) => {
  event.currentTarget.classList.remove(draggingClassName)
}
