import UIKit
import Expo
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleSignIn
import RNBootSplash
import KakaoSDKCommon
import KakaoSDKAuth
import FirebaseCore


@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    self.window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "main",
      in: self.window,
      launchOptions: launchOptions
    )

    if let rootView = self.window?.rootViewController?.view {
        RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
    }

    GIDSignIn.sharedInstance.restorePreviousSignIn { user, error in
      if error != nil || user == nil {
        // Show the app's signed-out state.
      } else {
        // Show the app's signed-in state.
      }
    }
      if let kakaoAppKey = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String {
             KakaoSDK.initSDK(appKey: kakaoAppKey)
        } else {
             print("Warning: KAKAO_APP_KEY not found in Info.plist")
        }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  override func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
    ) -> Bool {
        var handled = false


        // 1. Google Sign-In 처리 시도
        handled = GIDSignIn.sharedInstance.handle(url)
        if handled { return true }

        // 2. Kakao SDK 처리 시도
        if (AuthApi.isKakaoTalkLoginUrl(url)) {
            handled = AuthController.handleOpenUrl(url: url)
            if handled { return true }
        }
        return super.application(app, open: url, options: options)
    }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
