// const QuestItem = ({quest}: {quest: Quest}) => {
//   if (!quest) return null;

//   const startDate = quest.startDate
//     ? new Date(quest.startDate).toLocaleDateString()
//     : 'No start date';
//   const endDate = quest.endDate
//     ? new Date(quest.endDate).toLocaleDateString()
//     : 'No end date';

//   const now = new Date();
//   const endDateObj = quest.endDate ? new Date(quest.endDate) : null;
//   const timeDiff = endDateObj ? endDateObj.getTime() - now.getTime() : 0;
//   const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
//   const isDeadlineClose = daysRemaining <= 3 && daysRemaining >= 0;

//   const calculateReward = () => {
//     const baseExp = 50; // 기본 경험치
//     const timelineBonus = (quest.records.length || 0) * 10; // 타임라인 당 추가 경험치
//     const verificationBonus =
//       quest.verificationRequired && quest.verificationCount
//         ? quest.verificationCount * 10
//         : 0; // 인증 보너스
//     return baseExp + timelineBonus + verificationBonus;
//   };

//   const cardStyle: ViewStyle[] = [
//     styles.questCard,
//     ...(quest.isMain ? [styles.mainQuestCard] : []),
//     ...(quest.completed ||
//     (quest.requiredVerifications &&
//       (quest.verificationCount ?? 0) >= (quest.requiredVerifications ?? 0))
//       ? [styles.completedCard]
//       : []),
//   ];
//   const handleCompleteQuest = (quest: Quest) => {
//     // If verification is required, navigate to verification screen
//     if (quest.verificationRequired) {
//       // navigation.navigate('QuestVerification', { questId: quest.id } as any);
//       Alert.alert('인증 필요!', '인증을 완료해주세요!');
//     } else {
//       // Otherwise, complete the quest directly
//       // @ts-ignore - completeQuest will be available from AppContext
//       //completeQuest(quest.id);
//       Alert.alert('퀘스트 완료!', '퀘스트를 완료했습니다!');
//     }
//   };

//   return (
//     <TouchableOpacity
//       style={cardStyle}
//       //onPress={() => navigation.navigate('QuestDetail', { questId: quest.id })}
//     >
//       <View style={styles.questHeader}>
//         <Text style={styles.questTitle} numberOfLines={1}>
//           {quest.title}
//         </Text>
//         <Text style={styles.questDescription} numberOfLines={1}>
//           {quest && quest.description && quest.description.length > 50
//             ? `${quest.description.slice(0, 50)}...`
//             : quest.description}
//         </Text>
//         <View style={styles.dateRangeContainer}>
//           <Text style={styles.dateText}>
//             {startDate} ~ {endDate}
//           </Text>
//           <Text style={styles.dateRangeText}>
//             (총{' '}
//             {Math.ceil(
//               (new Date(quest.endDate).getTime() -
//                 new Date(quest.startDate).getTime()) /
//                 (1000 * 60 * 60 * 24),
//             )}
//             일간)
//           </Text>
//         </View>
//         <View style={styles.timelinePreview}>
//           <Text style={styles.timelineCount}>
//             타임라인 {quest.records.length || 0}개
//           </Text>
//           <View style={styles.timelineImages}>
//             <Image
//               source={require('../../assets/character/pico_base.png')}
//               style={styles.timelineThumbnail}
//               resizeMode="contain"
//             />
//           </View>
//         </View>
//         <View style={styles.verificationStatus}>
//           <Text style={styles.verificationText}>
//             {quest.verificationRequired ? '인증 필요' : '인증 불필요'}
//           </Text>
//           {isDeadlineClose && (
//             <Text style={styles.deadlineText}>
//               {daysRemaining === 0 ? '오늘 마감!' : `D-${daysRemaining}`}
//             </Text>
//           )}
//         </View>
//       </View>
//       <View style={styles.rewardSection}>
//         <Text style={styles.rewardText}>보상: {calculateReward()} EXP</Text>
//         {quest.verificationRequired && (
//           <Text style={styles.rewardDetail}>
//             (기본 50 + 타임라인 {quest.records.length || 0}개 × 10)
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity
//         style={[
//           styles.completeButton,
//           quest.completed ||
//           (quest.requiredVerifications &&
//             (quest.verificationCount ?? 0) >=
//               (quest.requiredVerifications ?? 0))
//             ? styles.completedButton
//             : null,
//         ]}
//         onPress={() => handleCompleteQuest(quest)}
//         disabled={
//           quest.completed ||
//           (quest.requiredVerifications
//             ? (quest.verificationCount ?? 0) >=
//               (quest.requiredVerifications ?? 0)
//             : false)
//         }>
//         <Text style={styles.completeButtonText}>
//           {quest.completed ||
//           (quest.requiredVerifications &&
//             (quest.verificationCount ?? 0) >=
//               (quest.requiredVerifications ?? 0))
//             ? quest.requiredVerifications &&
//               (quest.verificationCount ?? 0) >=
//                 (quest.requiredVerifications ?? 0)
//               ? '인증 완료'
//               : '완료됨'
//             : '완료하기'}
//           {quest.verificationRequired &&
//             !quest.completed &&
//             ` (${quest.verificationCount ?? 0}${
//               quest.requiredVerifications
//                 ? `/${quest.requiredVerifications}`
//                 : ''
//             })`}
//         </Text>
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );
// };
