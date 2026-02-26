import analytics from '@react-native-firebase/analytics';

// ============================================================
// Event Name Constants
// ============================================================
export const AnalyticsEvents = {
  // Auth
  LOGIN: 'login',
  SIGN_UP: 'sign_up',

  // Quest lifecycle
  ADD_QUEST: 'add_quest',
  COMPLETE_QUEST: 'complete_quest',
  DELETE_QUEST: 'delete_quest',
  DELETE_QUEST_ERROR: 'delete_quest_error',

  // Verification & Comments
  ADD_VERIFICATION_COMMENT: 'add_verification_comment',
  REPLY_ADD: 'reply_add',
  REPLY_REPORT: 'reply_report',

  // Social / Peer
  PEER_REQUEST: 'peer_request',
  PEER_ACCEPT: 'peer_accept',
  PEER_REJECT: 'peer_reject',

  // Report
  REPORT: 'report',
} as const;

// ============================================================
// Funnel Definitions (for documentation / Firebase Console setup)
// ============================================================
// Funnel 1 – 신규 유저 활성화:
//   sign_up → screen_view(Home) → add_quest → add_verification_comment
//
// Funnel 2 – 소셜 연결:
//   screen_view(Peers) → peer_request → peer_accept
//
// Funnel 3 – 퀘스트 완료 여정:
//   add_quest → add_verification_comment → complete_quest

// ============================================================
// Helper Functions
// ============================================================

/** 로그인 이벤트 */
export const logLogin = (method: 'google' | 'apple' | 'email' | 'kakao') => {
  analytics().logEvent(AnalyticsEvents.LOGIN, {method});
};

/** 회원가입 이벤트 */
export const logSignUp = (
  method: 'google' | 'apple' | 'email' | 'kakao',
  userType?: string,
) => {
  analytics().logEvent(AnalyticsEvents.SIGN_UP, {method, user_type: userType});
};

/** 퀘스트 생성 */
export const logAddQuest = (questTitle: string) => {
  analytics().logEvent(AnalyticsEvents.ADD_QUEST, {
    quest_title: questTitle,
  });
};

/** 퀘스트 완료 */
export const logCompleteQuest = (params: {
  quest_id: number;
  quest_title?: string;
  is_main?: boolean;
  verification_required?: boolean;
}) => {
  analytics().logEvent(AnalyticsEvents.COMPLETE_QUEST, params);
};

/** 퀘스트 삭제 (성공) */
export const logDeleteQuest = (questId: number) => {
  analytics().logEvent(AnalyticsEvents.DELETE_QUEST, {quest_id: questId});
};

/** 퀘스트 삭제 (에러) */
export const logDeleteQuestError = (errorMessage: string) => {
  analytics().logEvent(AnalyticsEvents.DELETE_QUEST_ERROR, {
    error: errorMessage,
  });
};

/** 인증 댓글 추가 */
export const logAddVerificationComment = (questId?: number) => {
  analytics().logEvent(AnalyticsEvents.ADD_VERIFICATION_COMMENT, {
    quest_id: questId,
  });
};

/** 답글 추가 */
export const logReplyAdd = (verificationId: number | null) => {
  analytics().logEvent(AnalyticsEvents.REPLY_ADD, {
    verification_id: verificationId,
  });
};

/** 답글 신고 */
export const logReplyReport = (verificationId: number | null) => {
  analytics().logEvent(AnalyticsEvents.REPLY_REPORT, {
    verification_id: verificationId,
  });
};

/** 피어 요청 */
export const logPeerRequest = (userId: number, from: string) => {
  analytics().logEvent(AnalyticsEvents.PEER_REQUEST, {user_id: userId, from});
};

/** 피어 수락 */
export const logPeerAccept = (userId: number, from: string) => {
  analytics().logEvent(AnalyticsEvents.PEER_ACCEPT, {user_id: userId, from});
};

/** 피어 거절 */
export const logPeerReject = (userId: number, from: string) => {
  analytics().logEvent(AnalyticsEvents.PEER_REJECT, {user_id: userId, from});
};

/** 신고 */
export const logReport = (reason: string, from: string) => {
  analytics().logEvent(AnalyticsEvents.REPORT, {reason, from});
};
