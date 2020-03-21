/**
 * Makes a read-only value editable
 * @param object: any
 */
export default function editable(object: any) {
  return JSON.parse(JSON.stringify(object));
}
