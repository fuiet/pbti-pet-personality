function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

Page({
  data: {
    card: null,
    posterPath: '',
    rendering: false
  },

  onShow() {
    const card = wx.getStorageSync('pbti_share_card') || null;
    this.setData({ card, posterPath: '' });
    if (card) this.renderPoster(card);
  },

  useSystemShare() {
    wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] });
    wx.showToast({ title: '已打开分享菜单', icon: 'none' });
  },

  saveHint() {
    wx.showModal({
      title: '分享卡片说明',
      content: '当前版本已经支持在小程序内绘制分享海报，并可尝试保存到相册。若图片资源来自临时路径，首次生成可能需要稍等片刻。',
      showCancel: false
    });
  },

  renderPoster(card) {
    this.setData({ rendering: true });
    const query = wx.createSelectorQuery().in(this);
    query.select('#sharePoster').fields({ node: true, size: true }).exec((res) => {
      const canvasNode = res && res[0] && res[0].node;
      if (!canvasNode) {
        this.setData({ rendering: false });
        return;
      }

      const ctx = canvasNode.getContext('2d');
      const width = 1080;
      const height = 1440;
      canvasNode.width = width;
      canvasNode.height = height;

      const exportPoster = () => {
        wx.canvasToTempFilePath({
          canvas: canvasNode,
          success: ({ tempFilePath }) => this.setData({ posterPath: tempFilePath, rendering: false }),
          fail: () => this.setData({ rendering: false })
        }, this);
      };

      const drawPosterContent = () => {
        ctx.fillStyle = '#171514';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 88px sans-serif';
        ctx.fillText(card.petName || '宠物', 60, 840);

        ctx.fillStyle = '#ffb07a';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText(`${card.code || 'PBTI'} · ${card.personalityName || ''}`, 60, 902);

        ctx.fillStyle = '#f2ddd0';
        ctx.font = '28px sans-serif';
        ctx.fillText(card.personalityTitle || '', 60, 950);

        ctx.fillStyle = '#ffffff';
        ctx.font = '32px sans-serif';
        const summary = card.summary || '';
        const lineOne = summary.slice(0, 24);
        const lineTwo = summary.slice(24, 48);
        const lineThree = summary.slice(48, 72);
        if (lineOne) ctx.fillText(lineOne, 60, 1035);
        if (lineTwo) ctx.fillText(lineTwo, 60, 1085);
        if (lineThree) ctx.fillText(lineThree, 60, 1135);

        (card.traits || []).slice(0, 4).forEach((trait, index) => {
          const x = 60 + index * 170;
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          roundRect(ctx, x, 1180, 150, 54, 27);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '26px sans-serif';
          ctx.fillText(trait, x + 28, 1215);
        });

        (card.dimensions || []).slice(0, 4).forEach((item, index) => {
          const y = 1310 + index * 28;
          const percent = Math.max(0, Math.min(100, Number(item.value) || 0));
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(item.label, 60, y);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${percent}%`, 1000, y);
          ctx.textAlign = 'left';
          ctx.fillStyle = '#3b3734';
          ctx.fillRect(220, y - 18, 780, 10);
          ctx.fillStyle = '#ff7a1a';
          ctx.fillRect(220, y - 18, 780 * percent / 100, 10);
        });

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`原型匹配度 ${card.fit || 0}%`, 60, 1420);

        exportPoster();
      };

      const imagePath = card.imageUrl;
      if (imagePath) {
        const img = canvasNode.createImage();
        img.onload = () => {
          const scale = Math.max(width / img.width, 720 / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          ctx.drawImage(img, (width - drawWidth) / 2, 140, drawWidth, drawHeight);
          ctx.fillStyle = 'rgba(23,21,20,0.24)';
          ctx.fillRect(0, 700, width, 130);
          drawPosterContent();
        };
        img.onerror = drawPosterContent;
        img.src = imagePath;
        return;
      }

      drawPosterContent();
    });
  },

  savePoster() {
    if (!this.data.posterPath) {
      wx.showToast({ title: '请先生成海报', icon: 'none' });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterPath,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: () => {
        wx.showModal({
          title: '保存失败',
          content: '请确认已经授权保存到相册，或稍后重试。',
          showCancel: false
        });
      }
    });
  },

  onShareAppMessage() {
    const card = this.data.card;
    if (!card) {
      return {
        title: '测测你家宠物是哪种 PBTI 性格',
        path: '/pages/home/index'
      };
    }

    return {
      title: `${card.petName} 的 PBTI 性格是 ${card.personalityName}`,
      path: '/pages/home/index',
      imageUrl: this.data.posterPath || card.imageUrl || ''
    };
  }
});
