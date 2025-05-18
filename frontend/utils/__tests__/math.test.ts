import { describe, it, expect } from 'vitest'
import { add, subtract, multiply } from '../math'

describe('Math functions', () => {
  describe('add', () => {
    it('adds two numbers correctly', () => {
      expect(add(1, 2)).toBe(3)
      expect(add(-1, 1)).toBe(0)
      expect(add(0, 0)).toBe(0)
    })
  })

  describe('subtract', () => {
    it('subtracts two numbers correctly', () => {
      expect(subtract(3, 2)).toBe(1)
      expect(subtract(1, 1)).toBe(0)
      expect(subtract(0, 5)).toBe(-5)
    })
  })

  describe('multiply', () => {
    it('multiplies two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6)
      expect(multiply(-2, 3)).toBe(-6)
      expect(multiply(0, 5)).toBe(0)
    })
  })
}) 