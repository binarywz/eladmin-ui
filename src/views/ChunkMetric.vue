<template>
  <div>
    <div id="map" class="map-main"></div>
  </div>
</template>

<script>
import 'leaflet'

require('leaflet/dist/leaflet.css');

export default {
  name: "ChunkCreate",
  data() {
    return {
      // L.map 对象
      map: null,
      // 地块id
      chunkId: 2,
      chunkCenter: null,
      borderCoord: null
    }
  },
  methods: {
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

      this.getLandChunkById();
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
    // 获取地块信息
    getLandChunkById() {
      this.$request.get('http://localhost:8000/rsensing/landchunk/getById', {
        params: {
          id: this.chunkId
        }
      }).then(res => {
        this.chunkCenter = res.data.center;
        this.borderCoord = res.data.borderCoord;
        if (this.chunkCenter !== undefined) {
          let lonAndLat = this.chunkCenter.split(',');
          this.map.setView([lonAndLat[1], lonAndLat[0]], 10);
        } else  {
          this.map.setView([36.807011, 118.017877], 10);
        }
        if (this.borderCoord !== undefined) {
          L.polygon(JSON.parse(this.borderCoord), {color: 'red'}).addTo(this.map);
        }
      })
    },
  },
  mounted() {
    // 初始化地图
    this.initMap();
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
