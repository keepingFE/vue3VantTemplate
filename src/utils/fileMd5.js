import SparkMD5 from 'spark-md5'

/**
 * 计算文件MD5值
 * @param {File} file - 文件对象
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<string>} MD5值
 */
export function calculateFileMD5(file, onProgress) {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024 // 2MB per chunk
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      try {
        spark.append(e.target.result)
        currentChunk++

        if (onProgress) {
          onProgress(Math.floor((currentChunk / chunks) * 100))
        }

        if (currentChunk < chunks) {
          loadNext()
        } else {
          const md5 = spark.end()
          resolve(md5)
        }
      } catch (error) {
        reject(error)
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const blob = file.slice(start, end)
      fileReader.readAsArrayBuffer(blob)
    }

    loadNext()
  })
}

/**
 * 计算文件块的MD5值
 * @param {Blob} chunk - 文件块
 * @returns {Promise<string>} MD5值
 */
export function calculateChunkMD5(chunk) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    const spark = new SparkMD5.ArrayBuffer()

    fileReader.onload = (e) => {
      try {
        spark.append(e.target.result)
        resolve(spark.end())
      } catch (error) {
        reject(error)
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件块读取失败'))
    }

    fileReader.readAsArrayBuffer(chunk)
  })
}
