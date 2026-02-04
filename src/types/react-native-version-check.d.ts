declare module 'react-native-version-check' {
  export interface NeedUpdateResult {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
    storeUrl: string;
  }

  export default class VersionCheck {
    /**
     * 현재 국가 코드를 반환합니다.
     */
    static getCountry(): Promise<string>;
    /**
     * 앱의 패키지 이름(Bundle ID)을 반환합니다.
     */
    static getPackageName(): string;
    /**
     * 현재 앱의 빌드 번호를 반환합니다.
     */
    static getCurrentBuildNumber(): number;
    /**
     * 현재 언어 설정을 반환합니다.
     */
    static getLang(): string;
    /**
     * 현재 앱의 버전을 반환합니다.
     */
    static getCurrentVersion(): string;
    /**
     * 스토어 URL을 반환합니다.
     */
    static getStoreUrl(option?: {
      appID?: string;
      ignoreErrors?: boolean;
    }): Promise<string>;
    /**
     * 스토어에 올라간 최신 버전을 반환합니다.
     */
    static getLatestVersion(option?: {
      provider?: string;
      forceUpdate?: boolean;
      fetchOptions?: any;
      ignoreErrors?: boolean;
    }): Promise<string>;
    /**
     * 업데이트가 필요한지 확인합니다.
     */
    static needUpdate(option?: {
      currentVersion?: string;
      latestVersion?: string;
      depth?: number;
      country?: string;
      provider?: string;
      forceUpdate?: boolean;
      fetchOptions?: any;
      ignoreErrors?: boolean;
    }): Promise<NeedUpdateResult>;
  }
}
