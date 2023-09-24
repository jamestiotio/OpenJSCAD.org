import test from 'ava'

import { comparePoints } from '../../../test/helpers/index.js'

import { colorize } from '../../colors/index.js'

import { geom3, poly3 } from '../../geometries/index.js'

import { measureArea, measureVolume } from '../../measurements/index.js'

import { cube, sphere } from '../../primitives/index.js'

import { offset } from './index.js'

test('offset: offset empty geom3', (t) => {
  const geometry = geom3.create()
  const result = offset({ }, geometry)
  t.notThrows(() => geom3.validate(result))
  t.is(measureArea(result), 0)
  t.is(measureVolume(result), 0)
  t.is(geom3.toPolygons(result).length, 0)
  t.is(geom3.toPoints(result).length, 0)
})

test('offset: offset geom3 preserves color', (t) => {
  const geometry = colorize([1, 0, 0], cube({ }))
  const result = offset({ }, geometry)
  t.deepEqual(result.color, [1, 0, 0, 1])
})

test('offset: offset of a geom3 produces expected changes to polygons', (t) => {
  const polygonsAsPoints = [
    [[-5, -5, -5], [-5, -5, 15], [-5, 15, 15], [-5, 15, -5]],
    [[15, -5, -5], [15, 15, -5], [15, 15, 15], [15, -5, 15]],
    [[-5, -5, -5], [15, -5, -5], [15, -5, 15], [-5, -5, 15]],
    [[-5, 15, -5], [-5, 15, 15], [15, 15, 15], [15, 15, -5]],
    [[-5, -5, -5], [-5, 15, -5], [15, 15, -5], [15, -5, -5]],
    [[-5, -5, 15], [15, -5, 15], [15, 15, 15], [-5, 15, 15]]
  ]
  const geometry = geom3.fromPoints(polygonsAsPoints)

  const obs = offset({ delta: 2, corners: 'round', segments: 8 }, geometry)
  const pts = geom3.toPoints(obs)
  const exp0 = [
    [-7, -5, -5],
    [-7, -5, 15],
    [-7, 15, 15],
    [-7, 15, -5]
  ]
  const exp61 = [
    [15, -7, 15],
    [16.414213562373096, -6.414213562373095, 15],
    [16, -6.414213562373095, 16]
  ]

  t.notThrows.skip(() => geom3.validate(obs))
  t.is(measureArea(obs), 3178.8059464475555)
  t.is(measureVolume(obs), 13504.574121271067)
  t.is(pts.length, 62)
  t.true(comparePoints(pts[0], exp0))
  t.true(comparePoints(pts[61], exp61))

  const geometry2 = sphere({ radius: 5, segments: 8 })
  const obs2 = offset({ delta: 5 }, geometry2)
  const pts2 = geom3.toPoints(obs2)
  t.notThrows.skip(() => geom3.validate(obs2))
  t.is(measureArea(obs), 3178.8059464475555)
  t.is(measureVolume(obs), 13504.574121271067)
  t.is(pts2.length, 864)
})

test('offsetGeom3: offset completes properly, issue 876', async (t) => {
  setTimeout(() => t.fail(), 1000)
  const polies = [
    poly3.create([[-19.61, -0.7999999999999986, 11.855], [-19.61, -0.8000000000000015, -11.855], [-19.61, -2.7500000000000018, -11.855], [-19.61, -2.7499999999999982, 11.855]]),
    poly3.create([[-17.32, -2.75, 10], [-17.32, -2.7500000000000013, -10], [-17.32, -0.8000000000000014, -10], [-17.32, -0.7999999999999987, 10]]),
    poly3.create([[-16.863040644206997, -0.8000000000000015, -10.28], [-16.863040644206997, -2.7500000000000018, -10.28], [-14.292644267871385, -2.7500000000000018, -11.855000000000016], [-14.292644267871383, -0.8000000000000015, -11.855000000000018]]),
    poly3.create([[-17.319999999999993, -0.8000000000000015, -9.999999999999996], [-17.319999999999993, -2.7500000000000018, -9.999999999999996], [-16.87560702649131, -2.7500000000000018, -10.272299999999998], [-16.866696319053347, -0.8000000000000015, -10.277759999999997]]),
    poly3.create([[-16.863040644207004, -2.7500000000000013, -10.280000000000001], [-16.863040644207004, -0.8000000000000014, -10.280000000000001], [-16.86669631905335, -0.8000000000000012, -10.27776], [-16.875607026491313, -2.75, -10.272300000000001]]),
    poly3.create([[-14.107140000000015, -0.7999999999999987, 11.85500000000003], [-14.107140000000015, -2.7499999999999982, 11.85500000000003], [-17.319999999999975, -2.7499999999999982, 9.999999999999956], [-17.319999999999975, -0.7999999999999987, 9.999999999999956]]),
    poly3.create([[-17.32, -0.7999999999999988, 9.999999999999993], [-17.32, -0.7999999999999986, 11.855], [-14.107139999999994, -0.7999999999999986, 11.855]]),
    poly3.create([[-17.32, -0.800000000000001, -11.855], [-17.32, -0.8000000000000008, -10.000000000000078], [-14.292644267871482, -0.800000000000001, -11.855]]),
    poly3.create([[-17.32, -0.800000000000001, -11.855], [-19.61, -0.800000000000001, -11.855], [-19.61, -0.7999999999999986, 11.855], [-17.32, -0.7999999999999986, 11.855]]),
    poly3.create([[-17.32, -2.7500000000000013, -10.000000000000076], [-17.32, -2.7500000000000018, -11.855], [-14.292644267871482, -2.7500000000000018, -11.855]]),
    poly3.create([[-17.32, -2.7499999999999982, 11.855], [-17.32, -2.7499999999999987, 9.999999999999996], [-14.107139999999996, -2.7499999999999982, 11.855]]),
    poly3.create([[-17.32, -2.7499999999999982, 11.855], [-19.61, -2.7499999999999982, 11.855], [-19.61, -2.7500000000000018, -11.855], [-17.32, -2.7500000000000018, -11.855]]),
    poly3.create([[-14.107139999999996, -0.7999999999999986, 11.855], [-19.61, -0.7999999999999986, 11.855], [-19.61, -2.7499999999999982, 11.855], [-14.107139999999994, -2.7499999999999982, 11.855]]),
    poly3.create([[-19.61, -0.8000000000000015, -11.855], [-14.292644267871486, -0.8000000000000015, -11.855], [-14.292644267871482, -2.7500000000000018, -11.855], [-19.61, -2.7500000000000018, -11.855]])
  ]

  const sub = geom3.create(polies)

  return new Promise((resolve, reject) => {
    offset({ delta: 1.3, corners: 'round', segments: 12 }, sub)
    t.pass()
    resolve()
  })
})
