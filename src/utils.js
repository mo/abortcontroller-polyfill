import Bowser from 'bowser';
import compareVersions from 'compare-versions';

function isVersionLt(versionToCheck, predicateVersion) {
  return compareVersions(versionToCheck, predicateVersion) < 0;
}

export function nativeAbortControllerIsBroken(self) {
  const { userAgent = '' } = self.navigator || {};
  const parser = Bowser.getParser(userAgent);

  const platform = parser.getPlatformType(true);
  const osName = parser.getOSName(true);
  const osVersion = parser.getOSVersion();
  const browserName = parser.getBrowserName(true);
  const browserVersion = parser.getBrowserVersion();

  const isDesktop = platform === 'desktop';
  const isMobile = platform === 'mobile';
  const isSafari = browserName === 'safari';
  const isIOS = osName === 'ios';

  const isDesktopSafariLt12_2 = isDesktop && isSafari && isVersionLt(browserVersion, '12.2');
  const isMobileIOSLt12_2 = isMobile && isIOS && isVersionLt(osVersion, '12.2');

  return isDesktopSafariLt12_2 || isMobileIOSLt12_2;
}
