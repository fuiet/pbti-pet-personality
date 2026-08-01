const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function latestPayload(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    testContext: doc.testContext || null,
    answers: doc.answers || {},
    result: doc.result || null,
    createdAt: doc.createdAt || null,
  };
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;
  const action = event?.action;
  const collection = db.collection("pbti_tests");

  if (action === "save") {
    const payload = event.payload || {};
    const data = {
      userId,
      testContext: payload.testContext || {},
      answers: payload.answers || {},
      result: payload.result || {},
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const saved = await collection.add({ data });
    return {
      ok: true,
      testId: saved._id,
      payload: {
        ...payload,
        testId: saved._id,
      },
    };
  }

  if (action === "latest") {
    const res = await collection
      .where({ userId })
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    return {
      ok: true,
      latest: latestPayload(res.data[0]),
    };
  }

  if (action === "delete") {
    const testId = event.testId;
    if (!testId) {
      throw new Error("Missing testId");
    }

    await collection.doc(testId).remove();
    return { ok: true };
  }

  throw new Error(`Unsupported action: ${action}`);
};
