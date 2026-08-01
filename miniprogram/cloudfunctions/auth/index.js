const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { code } = event || {};

  const userId = wxContext.OPENID;
  const unionId = wxContext.UNIONID || "";
  const now = db.serverDate();

  const userRef = db.collection("pbti_users").doc(userId);
  const userDoc = await userRef.get().catch(() => null);

  const baseProfile = {
    openid: userId,
    unionid: unionId,
    nickName: event?.profile?.nickName || "微信用户",
    avatarUrl: event?.profile?.avatarUrl || "",
    updatedAt: now,
  };

  if (userDoc && userDoc.data) {
    await userRef.update({
      data: {
        ...baseProfile,
        lastLoginAt: now,
      },
    });
  } else {
    await userRef.set({
      data: {
        ...baseProfile,
        createdAt: now,
        lastLoginAt: now,
      },
    });
  }

  return {
    ok: true,
    user: {
      userId,
      unionId,
      nickName: baseProfile.nickName,
      avatarUrl: baseProfile.avatarUrl,
    },
    code,
  };
};
