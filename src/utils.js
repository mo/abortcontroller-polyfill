function hasBrokenNativeAbortController(userAgent) {
  if (userAgent.match(/ (crios|gsa|fxios)\//i)) {
    return true;
  }
  if (userAgent.match(/ Safari\//i) && (
    userAgent.match(/ Version\/12.0/i) ||
    userAgent.match(/ Version\/12.1/i)
  )) {
    return true;
  }
  return false;
}

export function nativeAbortControllerIsBroken(self) {
  return self.navigator && self.navigator.userAgent &&
    hasBrokenNativeAbortController(self.navigator.userAgent);
}
