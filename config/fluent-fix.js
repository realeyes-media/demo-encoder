const exec = require('../exec')
const path = require('path')

module.exports = Command

/**
 * @constructor
 * The Command Constructor
 *
 **/
function Command(os, process, CmdType, { bin, win32ext = 'exe' } = {}) {
  /** @constant {string} - the bin folders of the executables */
  const DEFAULT_BIN = process.env.BENTO4_BIN || ''
  const instance = this
  CmdType = Command._ensureTypeIsNamedFunction(CmdType)

  if (!(instance instanceof Command)) {
    const obj = Object.create(Command.prototype)
    return Command.apply(obj, arguments)
  }

  instance.filename = `${CmdType.name.toLowerCase()}${os.platform() === 'win32' ? `.${win32ext}` : ''}`
  instance.bin = bin || DEFAULT_BIN
  instance.path = path.join(instance.bin, instance.filename)

  /**
   * Set the bin folder of the executable command
   * @param {string} [binPath=DEFAULT_BIN] - the path to the bin folder. defaults the env variable DEFAULT_BIN or ''
   *
   * @returns {Command} - Returns a new Command with the binPath set the passed in value
   **/
  instance.setBinPath = function(binPath = DEFAULT_BIN) {
    return CmdType(os, process, { bin: binPath })
  }

  /**
   * @param {string} input - path to input video
   * @param {Array} [args=[]] - Array of bento4 command arguments
   *
   * @returns {Promise} - resolves with stdout on success and stderr on failure
   **/
  instance.exec = function(input, args = []) {
    if (Array.isArray(input)) {
      input.forEach(i => args.push(i))
    } else {
      args.push(input)
    }
    return exec(instance.path, args).then(data => {
      if (args.some(a => a && a.toLowerCase() === 'json')) {
        return JSON.parse(data)
      }

      return data
    })
  }

  return Object.freeze(instance)
}

Command._ensureTypeIsNamedFunction = CmdType => {
  if (typeof CmdType === 'string') {
    let fn = function(os, process, options) {
      return new Command(os, process, CmdType, options)
    }

    Object.defineProperty(fn, 'name', { value: CmdType })

    return fn
  }

  return CmdType
}