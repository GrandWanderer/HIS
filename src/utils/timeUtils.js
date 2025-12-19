/**
 * Перетин інтервалів: [aStart, aEnd) та [bStart, bEnd)
 */
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function addMinutes(dt, minutes) {
  return new Date(dt.getTime() + minutes * 60_000);
}

module.exports = { intervalsOverlap, addMinutes };
