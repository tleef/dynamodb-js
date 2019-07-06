export default function removeUndefined(obj: any) {
  Object.entries(obj).forEach(([key, val]) => {
    if (val === undefined) {
      delete obj[key];
    } else {
      if (val !== null && typeof val === "object") {
        removeUndefined(val);
      }
    }
  });
  return obj;
}
