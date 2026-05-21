export type HorizontalSwipeGesture = {
  offsetX: number
  velocityX: number
}

const candidateRemovalOffsetThreshold = -84
const candidateRemovalVelocityThreshold = -560
const candidateClickSuppressionOffsetThreshold = 8
const candidateClickSuppressionVelocityThreshold = 120

export function shouldRemoveCandidateBySwipe({
  offsetX,
  velocityX,
}: HorizontalSwipeGesture) {
  return (
    offsetX <= candidateRemovalOffsetThreshold ||
    velocityX <= candidateRemovalVelocityThreshold
  )
}

export function shouldSuppressCandidateClickAfterSwipe({
  offsetX,
  velocityX,
}: HorizontalSwipeGesture) {
  return (
    Math.abs(offsetX) >= candidateClickSuppressionOffsetThreshold ||
    Math.abs(velocityX) >= candidateClickSuppressionVelocityThreshold
  )
}
