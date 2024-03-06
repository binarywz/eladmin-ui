<template>
  <div>
    <div id="map" class="map-main"></div>
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input v-model="searchAddrInput" placeholder="定位搜索" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="searchAddr"></el-button>
      </el-input>
    </div>

    <!-- 添加地块框 -->
    <el-form ref="chunkForm" :model="chunkForm" label-width="100px" class="add-box">
      <el-form-item size="mini">
      </el-form-item>
      <el-form-item label="选择地区">
        <el-select v-model="selectRegionId" placeholder="请选择" style="width: 200px">
          <el-option
              v-for="item in regionList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="地块名称">
        <el-input v-model="chunkForm.name" style="width: 200px" placeholder="请输入地块名"></el-input>
      </el-form-item>
      <el-form-item label="地块坐标">
        <el-input v-model="chunkForm.center" style="width: 200px" placeholder="绘制地图获取" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="createChunk">创建</el-button>
        <el-button size="small" @click="clearChunkForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 地图工具 -->
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
  name: "ChunkCreate",
  data() {
    return {
      // L.map 对象
      map: null,
      // L.Control.Draw 控件对象
      drawControl: null,
      // 绘制对象
      drawRegion: null,
      // 图形图层组
      drawLayerGroup: null,

      searchAddrInput: null,
      centerLonAndLat: null,

      chunkForm: {
        name: '',
        center: '',
        borderCoord: null,
        source: "ADD",
        regionId: null
      },
      regionList: [],
      selectRegionId: null
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
    // 清除绘制
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

      // 设置范围
      this.map.setView([36.807011, 118.017877], 10);
      // 矢量图+注记
      // let mapTypes = ['vec_c', 'cva_c'];
      // 影像图+注记
      let mapTypes = ['img_c', 'cia_c'];
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
      let drawLayer = e.layer, borderList = drawLayer.getLatLngs()[0], borderCoord = [];
      let cLat = 0.0, cLon = 0.0;
      for (let i = 0; i < borderList.length; i++) {
        cLat += borderList[i].lat;
        cLon += borderList[i].lng;
        borderCoord.push([borderList[i].lat, borderList[i].lng]);
      }
      this.chunkForm.borderCoord = borderCoord;
      this.chunkForm.center = cLon / borderList.length + "," + cLat / borderList.length;
      this.chunkForm.regionId = this.selectRegionId;
      // 判断当前没有图层组，需先添加
      if (!this.drawLayerGroup) {
        // 图层组
        this.drawLayerGroup = new L.FeatureGroup();
        // 添加
        this.map.addLayer(this.drawLayerGroup);
      }
      // 添加到图层组
      this.drawLayerGroup.addLayer(drawLayer);
    },
    // 初始化绘制控件
    initDrawCtrl() {
      // 初始化绘制控件
      this.drawControl = new L.Control.Draw({
        draw: false
      }).addTo(this.map); // 要添加到 L.map 对象中
      // 添加绘制完监听事件
      this.map.on(L.Draw.Event.CREATED, this.drawCreatedBack);
    },
    searchAddr() {
      // 使用fetch处理跨域
      fetch('https://restapi.amap.com/v3/config/district?key=6781cb23812440b829b6adb0a454045c&keywords=' + this.searchAddrInput, {
        method: 'get'
      }).then(res => {
        return res.json();
      }).then(res => {
        let district = res.districts[0];
        this.centerLonAndLat = district.center;
        let lonAndLat = this.centerLonAndLat.split(',');
        let lat = lonAndLat[1];
        let lon = lonAndLat[0];
        this.map.setView([lat, lon], 10);
        this.searchAddrInput = '';
      }).catch(err => {
        console.log("请求高德地图出错, ", err);
      });
    },
    createChunk() {
      this.$request.post('http://localhost:8000/rsensing/landchunk/add', this.chunkForm).then(res => {
        console.log("createChunk success...")
      }).catch((err) => {
        console.log("createChunk failed, ", err)
      });
    },
    clearChunkForm() {
      this.clearDraw();
      this.chunkForm = null;
      this.borderCoord = null;
    },
    getRegionList() {
      this.$request.post('http://localhost:8000/rsensing/region/list', {}).then(res => {
        if (res.data !== undefined) {
          this.regionList = res.data;
        } else {
          console.log("region list empty,");
        }
      }).catch((err) => {
        console.log("createChunk failed, ", err);
      });
    }
  },
  mounted() {
    // 获取地区列表
    this.getRegionList();
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
  position: absolute;
  top: 20px;
  left: 8px;
  width: 189px;
  height: 30px;
  opacity: 1;
  border-radius: 3px;
  background: rgba(232, 232, 232, 1);
}

.map-tool {
  z-index: 2000;
  position: absolute;
  top: 100px;
  left: 20px;
  width: 63px;
  height: 150px;
  opacity: 1;
  border-radius: 3px;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(7px);

  .btn-edit-mark {
    margin-top: 20px;
  }

  .btn-edit-del {
    margin-top: 20px;
  }
}

.add-box {
  z-index: 2000;
  position: relative;
  top: 20px;
  left: 1437px;
  width: 350px;
  height: 270px;
  opacity: 1;
  border-radius: 3px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 4px  rgba(0, 0, 0, 0.02);
}

</style>
