import * as fs from "fs"
import * as readline from "readline";

export function prompt(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(text, answer => {
      rl.close();
      resolve(answer);
    });
    rl.on("error", reject);
  });
}

/**
 * 递归列表文件夹文件
 * @param dir 目录
 */
export function readDirRecursiveSync(dir: string) {
  if (!fs.statSync(dir).isDirectory()) {
    return [dir]
  } else {
    const files: string[] = []
    fs.readdirSync(dir).forEach(subDir => files.push(...readDirRecursiveSync(`${dir}/${subDir}`)))
    return files
  }
}

/**
 * 按行读取多个文件
 * @param files 多文件地址
 */
export async function readLineSync(files: string[], onRead: (text: string) => void) {
  for (const file of files) {
    await readOneFile(file)
  }

  function readOneFile(file: string) {
    return new Promise((res, rej) => {
      try {
        const stream = fs.createReadStream(file)

        const rl = readline.createInterface({ input: stream })

        rl.on("line", text => onRead(text))

        rl.on("close", () => res("finish"))
      } catch (e) {
        rej(e)
      }
    })
  }
}
