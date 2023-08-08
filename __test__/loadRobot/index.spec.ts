import Robot from '@/loadRobot'

/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://jestjs.io/"}
 *
 */
describe('class EnvConfig', () => {
  it('create a instance by static function', () => {
    const robot = Robot.createInstance(
      {
        localhost: {
          env: 'dev'
        },
        'localhost/grey': {
          env: 'grey'
        }
      },
      { force: true }
    )

    expect(robot.getEnvConfig()).toEqual({ env: 'grey' })
  })
})
