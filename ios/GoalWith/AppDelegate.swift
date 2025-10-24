import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleSignIn
import RNBootSplash
import KakaoSDKCommon
import KakaoSDKAuth

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "GoalWith",
      in: window,
      launchOptions: launchOptions
    )

    GIDSignIn.sharedInstance.restorePreviousSignIn { user, error in
      if error != nil || user == nil {
        // Show the app's signed-out state.
      } else {
        // Show the app's signed-in state.
      }
    }
    if let kakaoAppKey = Bundle.main.object(forInfoDictionaryKey: "d1390db21826a41c019fb272011b1d17") as? String {
             KakaoSDK.initSDK(appKey: kakaoAppKey)
        } else {
             print("Warning: KAKAO_APP_KEY not found in Info.plist")
        }
    return true
  }
  func application(
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
        return false
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️ initialize the splash screen
  }
}
