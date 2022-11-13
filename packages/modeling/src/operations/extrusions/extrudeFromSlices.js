import * as mat4 from '../../maths/mat4/index.js'

import * as geom2 from '../../geometries/geom2/index.js'
import * as geom3 from '../../geometries/geom3/index.js'
import * as poly3 from '../../geometries/poly3/index.js'

import * as slice from './slice/index.js'
import repairSlice from './slice/repair.js'

import extrudeWalls from './extrudeWalls.js'

const defaultCallback = (progress, index, base) => {
  let baseSlice = null
  if (geom2.isA(base)) baseSlice = slice.fromSides(geom2.toSides(base))
  if (poly3.isA(base)) baseSlice = slice.fromPoints(poly3.toPoints(base))

  return progress === 0 || progress === 1 ? slice.transform(mat4.fromTranslation(mat4.create(), [0, 0, progress]), baseSlice) : null
}

/**
 * Extrude a solid from the slices as returned by the callback function.
 * @see slice
 *
 * @param {Object} options - options for extrude
 * @param {Integer} [options.numberOfSlices=2] the number of slices to be generated by the callback
 * @param {Boolean} [options.capStart=true] the solid should have a cap at the start
 * @param {Boolean} [options.capEnd=true] the solid should have a cap at the end
 * @param {Boolean} [options.close=false] the solid should have a closing section between start and end
 * @param {Boolean} [options.repair=true] - repair gaps in the geometry
 * @param {Function} [options.callback] the callback function that generates each slice
 * @param {Object} base - the base object which is used to create slices (see the example for callback information)
 * @return {geom3} the extruded shape
 * @alias module:modeling/extrusions.extrudeFromSlices
 *
 * @example
 * // Parameters:
 * //   progress : the percent complete [0..1]
 * //   index : the index of the current slice [0..numberOfSlices - 1]
 * //   base : the base object as given
 * // Return Value:
 * //   slice or null (to skip)
 * const callback = (progress, index, base) => {
 *   ...
 *   return slice
 * }
 */
export const extrudeFromSlices = (options, base) => {
  const defaults = {
    numberOfSlices: 2,
    capStart: true,
    capEnd: true,
    close: false,
    repair: true,
    callback: defaultCallback
  }
  const { numberOfSlices, capStart, capEnd, close, repair, callback: generate } = Object.assign({ }, defaults, options)

  if (numberOfSlices < 2) throw new Error('numberOfSlices must be 2 or more')

  // Repair gaps in the base slice
  if (repair) {
    // note: base must be a slice, if base is geom2 this doesn't repair
    base = repairSlice(base)
  }

  const sMax = numberOfSlices - 1

  let startSlice = null
  let endSlice = null
  let prevSlice = null
  let polygons = []
  for (let s = 0; s < numberOfSlices; s++) {
    // invoke the callback function to get the next slice
    // NOTE: callback can return null to skip the slice
    const currentSlice = generate(s / sMax, s, base)

    if (currentSlice) {
      if (!slice.isA(currentSlice)) throw new Error('the callback function must return slice objects')

      const edges = slice.toEdges(currentSlice)
      if (edges.length === 0) throw new Error('the callback function must return slices with one or more edges')

      if (prevSlice) {
        polygons = polygons.concat(extrudeWalls(prevSlice, currentSlice))
      }

      // save start and end slices for caps if necessary
      if (s === 0) startSlice = currentSlice
      if (s === (numberOfSlices - 1)) endSlice = currentSlice

      prevSlice = currentSlice
    }
  }

  if (capEnd) {
    // create a cap at the end
    const endPolygons = slice.toPolygons(endSlice)
    polygons = polygons.concat(endPolygons)
  }
  if (capStart) {
    // create a cap at the start
    const startPolygons = slice.toPolygons(startSlice).map(poly3.invert)
    polygons = polygons.concat(startPolygons)
  }
  if (!capStart && !capEnd) {
    // create walls between end and start slices
    if (close && !slice.equals(endSlice, startSlice)) {
      polygons = polygons.concat(extrudeWalls(endSlice, startSlice))
    }
  }
  return geom3.create(polygons)
}

export default extrudeFromSlices
