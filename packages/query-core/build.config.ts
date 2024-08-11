import { defineBuildConfig } from 'unbuild'
import fs from 'node:fs'
import path from 'node:path'

// 同步获取指定文件夹下所有文件的路径
const getFilesInDirectorySync = (directory: string) => {
  try {
    // 读取目录下所有文件和子目录
    const files = fs.readdirSync(directory)

    // 获取所有文件的完整路径
    const filePaths = files.map((file) => path.join(directory, file))

    return filePaths
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

const directoryPath = 'src' // 指定文件夹路径
let filePaths = getFilesInDirectorySync(directoryPath)
filePaths = filePaths.filter((item) => item.includes('.ts'))

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: filePaths,
  sourcemap: true,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
})
