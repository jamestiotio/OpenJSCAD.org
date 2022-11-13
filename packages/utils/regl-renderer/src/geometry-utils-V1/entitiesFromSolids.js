import mat4 from 'gl-mat4'

import { flatten, toArray } from '@jscad/array-utils'

import csgToGeometries from './csgToGeometries.js'
import cagToGeometries from './cagToGeometries.js'
import computeBounds from '../bound-utils/computeBounds.js'

export const entitiesFromSolids = (params, solids) => {
  const defaults = {
    meshColor: [0, 0.6, 1, 1],
    smoothNormals: true
  }
  const { meshColor, smoothNormals } = defaults
  // const defaultColor = params.rendering.meshColor
  solids = toArray(solids)
  // warning !!! fixTJunctions alters the csg and can result in visual issues ??
  // .fixTJunctions()
  // cachedSolids = solids
  // const start = performance.now()
  const entities = solids.map((solid) => {
    let geometry
    let type
    if ('sides' in solid) {
      type = '2d'
      geometry = cagToGeometries(solid, { color: meshColor })
    } else if ('polygons' in solid) {
      type = '3d'
      geometry = csgToGeometries(solid, {
        smoothLighting: smoothNormals,
        normalThreshold: 0.3,
        faceColor: meshColor
      })//, normalThreshold: 0})
    }
    // geometry = flatten(geometries)// FXIME : ACTUALLY deal with arrays since a single csg can
    // generate multiple geometries if positions count is >65535
    geometry = flatten(geometry)[0]

    // bounds
    const bounds = computeBounds({ geometry })// FXIME : ACTUALLY deal with arrays as inputs see above

    // transforms: for now not used, since all transformed are stored in the geometry
    // FIXME : for V2 we will be able to use the transfors provided by the solids directly
    const matrix = mat4.identity([])

    const transforms = {
      matrix
      /* const modelViewMatrix = mat4.multiply(mat4.create(), model, props.camera.view)
      const normalMatrix = mat4.create()
      mat4.invert(normalMatrix, modelViewMatrix)
      mat4.transpose(normalMatrix, normalMatrix)
      return normalMatrix */
    }

    const visuals = {
      drawCmd: 'drawMesh',
      show: true,
      color: meshColor,
      transparent: geometry.isTransparent, // not sure
      useVertexColors: true
    }

    const entity = {
      type,
      geometry,
      transforms,
      bounds,
      visuals,
      isTransparent: geometry.isTransparent
    }
    return entity
  })
  // }
  return entities
}

export default entitiesFromSolids
