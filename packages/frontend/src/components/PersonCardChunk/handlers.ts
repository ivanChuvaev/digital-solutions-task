export const dragStartHandler = (
  event: React.DragEvent<HTMLLIElement>,
  personId: number,
  chunkIndex: number,
) => {
  event.dataTransfer.setData('personId', personId.toString())
  event.dataTransfer.setData('chunkIndex', chunkIndex.toString())
  event.dataTransfer.effectAllowed = 'move'
}

export const dragOverHandler = (event: React.DragEvent<HTMLLIElement>) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

export const dropHandler = (
  event: React.DragEvent<HTMLLIElement>,
  personId: number,
  chunkIndex: number,
  callback?: (
    aChunkIndex: number,
    aPersonId: number,
    bChunkIndex: number,
    bPersonId: number,
  ) => void,
) => {
  event.preventDefault()
  const transferredPersonId = parseInt(event.dataTransfer.getData('personId'))
  const transferredChunkIndex = parseInt(
    event.dataTransfer.getData('chunkIndex'),
  )
  if (
    callback &&
    !Number.isNaN(transferredPersonId) &&
    !Number.isNaN(transferredChunkIndex)
  ) {
    callback(transferredChunkIndex, transferredPersonId, chunkIndex, personId)
  }
}
