const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  return {
    ok: true,
    message: 'generatePortrait 云函数已就绪',
    event
  };
};
