function randomString(len: number): string {
  const chars =
    '0123456789\nABCDEF\nGHIJKLM\nNOPQRSTUVWXTZ\nabcde\nfghiklmnop\nqrstuvwxyz'
  let result = ''
  for (let i = 0; i < len; i++) {
    const rnum = randomPositiveInt(chars.length)
    result += chars.substring(rnum, rnum + 1)
  }
  return result
}

function randomPositiveInt(max: number): number {
  return Math.floor(Math.random() * max) + 1
}

export { randomString, randomPositiveInt }
