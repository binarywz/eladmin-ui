<template>
  <div>
    <div id="map" class="map-main"></div>
    <div class="search-box">
      <el-input placeholder="定位搜索" class="input-with-select">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>
    <div class="map-tool">
      <el-row>
        <el-button class="btn-edit-mark" icon="el-icon-edit" plain circle @click="startDraw"></el-button>
      </el-row>
      <el-row>
        <el-button class="btn-edit-del" icon="el-icon-delete" plain circle @click="clearDraw"></el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
import 'leaflet'
import 'leaflet-draw'
import '@/components/leaflet/Leaflet.draw.cn'

require('leaflet/dist/leaflet.css');
require('leaflet-draw/dist/leaflet.draw.css');

export default {
  name: "AreaCreate",
  data() {
    return {
      // L.map 对象
      map: null,
      // L.Control.Draw 控件对象
      drawControl: null,
      // 绘制对象
      drawRegion: null,
      // 图形图层组
      drawLayerGroup: null
    }
  },
  methods: {
    // 启动绘制
    startDraw() {
      // 先取消
      if (this.drawRegion) {
        this.drawRegion.disable();
      }
      this.drawRegion = new L.Draw.Polygon(this.map, this.drawControl.options.draw.polygon);
      // 启动
      this.drawRegion.enable();
    },
    //清除绘制
    clearDraw() {
      // 删除全部绘制的图层
      if (this.drawLayerGroup) {
        this.drawLayerGroup.clearLayers();
      }
      // 取消绘制操作
      this.drawRegion.disable();
    },
    // 初始化地图
    initMap() {
      // 初始化地图容器并显天地图
      this.map = L.map('map', {
        // 参考坐标系
        crs: L.CRS.EPSG4326,
        // 不添加属性说明控件
        attributionControl: false,
        zoomControl:false,
        // 限制显示地理范围
        maxBounds: L.latLngBounds(L.latLng(-180, -180), L.latLng(180, 180)),
      });

      // 设置范围(这里是武汉)
      this.map.setView([30.59, 114.32], 10);
      // 矢量图+注记
      // let mapTypes = ['vec_c', 'cva_c'];
      // 影像图+注记
      let mapTypes = ['img_c'];
      // 天地图 token
      let tdtToken = 'ed8dea2ce0960c457a106119e8d29ef0';
      let layers = [];
      for (let i = 0, len = mapTypes.length; i < len; i++) {
        let tdtUrl = `http://t0.tianditu.gov.cn/DataServer?T=${mapTypes[i]}&x={x}&y={y}&l={z}&tk=${tdtToken}`;
        let layer = L.tileLayer(tdtUrl, {
          zoomOffset: 1,
          noWrap: true,
          bounds: [[-90, -180], [90, 180]]
        });
        layers.push(layer);
      }
      L.layerGroup(layers).addTo(this.map);
    },
    // 交互绘制回调
    drawCreatedBack(e) {
      console.log('绘制完成', e);
      // 绘制的图形图层对象
      let drawLayer = e.layer;
      let coord = drawLayer.getLatLngs()[0];
      console.log("边界经纬度坐标列表", coord);
      // 判断当前没有图层组，需先添加
      if (!this.drawLayerGroup) {
        //图层组
        this.drawLayerGroup = new L.FeatureGroup();
        // 添加
        this.map.addLayer(this.drawLayerGroup);
      }
      // 添加到图层组
      this.drawLayerGroup.addLayer(drawLayer);
    },
    // 初始化绘制控件
    initDrawCtrl() {
      //初始化绘制控件
      this.drawControl = new L.Control.Draw({
        // position: 'topright',//控件位置 'topleft'(默认), 'topright', 'bottomleft' or 'bottomright'
        draw: false
      }).addTo(this.map); // 要添加到 L.map 对象中
      // 添加绘制完监听事件
      this.map.on(L.Draw.Event.CREATED, this.drawCreatedBack);
    }
  },
  mounted() {
    // 初始化地图
    this.initMap();
    // 初始化绘制控件
    this.initDrawCtrl();
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">

.map-main {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #CCC;
}

.search-box {
  z-index: 2000;
  position: relative;
  top: 20px;
  left: 8px;
  width: 189px;
  height: 30px;
  opacity: 1;
  border-radius: 5px;
  background: rgba(232, 232, 232, 1);
}

.map-tool {
  z-index: 2000;
  position: relative;
  top: 72px;
  left: 8px;
  width: 63px;
  height: 150px;
  opacity: 1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(7px);

  .btn-edit-mark {
    margin-top: 20px;
  }

  .btn-edit-del {
    margin-top: 20px;
  }
}

</style>
