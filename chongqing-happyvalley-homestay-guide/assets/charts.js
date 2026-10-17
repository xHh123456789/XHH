// assets/charts.js
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: distance vs price scatter ---
  var el = document.getElementById('chart-scatter');
  if (!el) return;
  var chart = echarts.init(el, null, { renderer: 'svg' });

  // [distance km, price CNY, name]
  var threeBed = [
    [0.5, 498, '悦来会展温馨三居室（对面就是欢乐谷）'],
    [0.5, 619, '猫小懒·璞悦公馆（步行5分钟到欢乐谷）'],
    [5.8, 288, '旅途行民宿·国博领馆3期（唯一≤300元三居）']
  ];
  var others = [
    [0.3, 653, '喜乐民宿·舒适三床套房（华悦中心）'],
    [0.3, 468, '乐际民宿·乐享天际三床套房（华悦中心）'],
    [0.5, 328, '悦夏·欢乐谷Loft（1室）'],
    [0.8, 309, '且住·国博线Loft（2室）'],
    [3.5, 228, '风玲民宿（重光站旁，2室）']
  ];

  chart.setOption({
    animation: false,
    grid: { left: 60, right: 30, top: 60, bottom: 56 },
    legend: {
      top: 8,
      textStyle: { color: ink, fontSize: 12 },
      data: ['三居室 / 三张床', '单间 / 1-2居']
    },
    tooltip: {
      appendToBody: true,
      formatter: function (p) {
        return '<strong>' + p.data[2] + '</strong><br/>距欢乐谷约 ' + p.data[0] + ' km<br/>挂牌价 ¥' + p.data[1] + '/晚';
      }
    },
    xAxis: {
      type: 'value',
      name: '距欢乐谷直线距离（km）',
      nameLocation: 'middle',
      nameGap: 32,
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 7,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: '挂牌价（元/晚）',
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 750,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '三居室 / 三张床',
        type: 'scatter',
        data: threeBed,
        symbol: 'triangle',
        symbolSize: 18,
        itemStyle: { color: accent },
        label: {
          show: true,
          position: 'right',
          formatter: function (p) { return p.data[2].split('（')[0]; },
          color: ink,
          fontSize: 11
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: accent2, type: 'dashed', width: 2 },
          label: { color: accent2, fontSize: 11 },
          data: [
            { yAxis: 300, label: { formatter: '预算线 ¥300', position: 'insideEndTop' } },
            { xAxis: 5, label: { formatter: '距离线 5km', position: 'insideEndTop' } }
          ]
        },
        markArea: {
          silent: true,
          itemStyle: { color: accent2, opacity: 0.07 },
          label: { show: true, color: accent2, fontSize: 12, position: 'inside' },
          data: [
            [
              { xAxis: 0, yAxis: 0, name: '目标区间（当前为空）' },
              { xAxis: 5, yAxis: 300 }
            ]
          ]
        }
      },
      {
        name: '单间 / 1-2居',
        type: 'scatter',
        data: others,
        symbol: 'circle',
        symbolSize: 13,
        itemStyle: { color: muted, opacity: 0.75 },
        label: {
          show: true,
          position: 'right',
          formatter: function (p) { return p.data[2].split('（')[0]; },
          color: muted,
          fontSize: 10
        }
      }
    ]
  });

  window.addEventListener('resize', function () { chart.resize(); });
})();
