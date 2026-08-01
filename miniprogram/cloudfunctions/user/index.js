const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;
  const action = event?.action;
  const collection = db.collection("pbti_users");

  if (action === "get") {
    const res = await collection.doc(userId).get().catch(() => null);
    return {
      ok: true,
      user: res?.data || null,
    };
  }

  if (action === "upsert") {
    const payload = event.payload || {};
    const now = db.serverDate();
    const current = await collection.doc(userId).get().catch(() => null);

    const data = {
      openid: userId,
      nickName: payload.nickName || "微信用户",
      avatarUrl: payload.avatarUrl || "",
      updatedAt: now,
    };

    if (current?.data) {
      await collection.doc(userId).update({
        data,
      });
    } else {
      await collection.doc(userId).set({
        data: {
          ...data,
          createdAt: now,
        },
      });
    }

    return {
      ok: true,
      user: {
        _id: userId,
        ...data,
      },
    };
  }

  throw new Error(`Unsupported action: ${action}`);
};
