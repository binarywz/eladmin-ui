<template>
  <div>
    <!-- 天地图 -->
    <div id="map" class="map-main"></div>

    <!-- 添加地块框 -->
    <div class="region-chunk-box">
      <div class="chunk-bok-title">地区列表</div>
      <el-tree
          :data="regionList"
          node-key="id"
          :props="regionChunkProps"
          :default-expanded-keys=[1]
          class="region-chunk-tree"
          @node-click="handleChunkNodeClick">
      </el-tree>
    </div>
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
      borderCoord: null,
      regionList: [],
      regionChunkProps: {
        children: 'landChunkList',
        label: 'name'
      }
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
      // 影像图+注记
      let mapTypes = ['img_c', 'cia_c'];
      // 天地图 token
      let tdtToken = 'ed8dea2ce0960c457a106119e8d29ef0';
      let layers = [];
      for (let i = 0, len = mapTypes.length; i < len; i++) {
        let tdtUrl = `https://t0.tianditu.gov.cn/DataServer?T=${mapTypes[i]}&x={x}&y={y}&l={z}&tk=${tdtToken}`;
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
        this.setMapView(res.data.center, res.data.borderCoord);
      })
    },
    getRegionAndChunk() {
      this.$request.post('http://localhost:8000/rsensing/region/getRegionAndChunk', {}).then(res => {
        if (res.data !== undefined) {
          this.regionList = res.data;
          console.log("regionList: ", this.regionList);
        } else {
          console.log("region list empty,");
        }
      }).catch((err) => {
        console.log("createChunk failed, ", err);
      });
    },
    handleChunkNodeClick(node) {
      // 非叶子节点不触发切换视图
      if (node.landChunkList !== undefined) {
        return;
      }
      this.clearBorderList();
      this.setMapView(node.center, node.borderCoord);
    },
    setMapView(center, borderCoord) {
      this.chunkCenter = center;
      this.borderCoord = borderCoord;
      if (this.chunkCenter !== undefined) {
        let lonAndLat = this.chunkCenter.split(',');
        this.map.setView([lonAndLat[1], lonAndLat[0]], 15);
      } else  {
        this.map.setView([36.807011, 118.017877], 15);
      }
      if (this.borderCoord !== undefined) {
        L.polygon(JSON.parse(this.borderCoord), {color: 'red'}).addTo(this.map);
      }
    },
    clearBorderList() {
      this.map.eachLayer(function (layer) {
        if (layer._path != null) {
          layer.remove();
        }
      });
    },
  },
  mounted() {
    // 获取区域
    this.getRegionAndChunk();
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

.region-chunk-box {
  z-index: 2000;
  position: relative;
  top: 20px;
  left: 20px;
  width: 200px;
  height: 270px;
  border-radius: 3px;

  .chunk-bok-title {
    height: 30px;
    line-height: 30px;
    background-color: #333;
    font-size: 18px;
    color: #ffffff;
  }

  .region-chunk-tree {
    padding-top: 10px;
    height: 270px;
    background: rgba(16, 17, 17, .69);

    .el-tree-node__label {
      color: #ffffff;
      font-size: 16px;
    }

    .el-tree-node:focus > .el-tree-node__content {
      background-color: #66b1ff87 !important;
    }

    .el-tree-node__content:hover {
      background-color: #66b1ff87;
    }

  }
}

</style>
