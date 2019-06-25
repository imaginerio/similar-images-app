<template>
  <div class="container">
    <div>
      <!-- <pre>
        {{images}}
      </pre>-->
    </div>
    <div class="photo-card" v-for="photo in images" :key="photo._id">
      <div class="photo-item">
        <img class="photo" :src="`/photos/${photo._id}.jpg`" alt>
        <div class="img-menu">
          <p>id: {{photo._id}}</p>
          <el-button-group>
            <el-button
              type="primary"
              icon="el-icon-copy-document"
              size="mini"
              @click="copyImagesIdToClipboard(photo)"
            ></el-button>
          </el-button-group>
        </div>
      </div>
      <div class="similars">
        <div
          v-for="(similar, similarIndex) in photo.neighbors"
          :key="similar.filename"
          class="photo-item"
        >
          <img
            class="photo"
            @click="selectSimilar(photo, similarIndex, similar.filename )"
            :class="{ active: similar.isSamePhoto }"
            :src="`/photos/${similar.filename}.jpg`"
            alt
          >
          <div class="img-menu">
            <p>{{similar.filename}}</p>
            <p>Similarity: {{similar.similarity * 100}}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'
import axios from 'axios'
import _ from 'lodash'

export default {
  components: {
    Logo
  },
  data() {
    return {
      _images: [
        {
          _id: '001AAN005147',
          fileName: '001AAN005147.json',
          neighbors: [
            { filename: '001AAN005147', similarity: 1 },
            { filename: '001AAN005149', similarity: 0.8897 },
            { filename: '001AN01002020', similarity: 0.8167 },
            { filename: '002080RJ0103', similarity: 0.8064 },
            { filename: '0071824cx001-09', similarity: 0.7964 },
            { filename: '001AN01002021', similarity: 0.7897 },
            { filename: '002027BRRJ021', similarity: 0.788 },
            { filename: '007SN-02', similarity: 0.7868 },
            { filename: '002001MF003001', similarity: 0.7842 },
            { filename: '002080RJ2202', similarity: 0.78 },
            { filename: '001AN01002019', similarity: 0.7691 },
            { filename: '001AN01001005', similarity: 0.7618 },
            { filename: '007A6P3F03-045', similarity: 0.7589 },
            { filename: '007ALA089', similarity: 0.7529 },
            { filename: '007A5P4F05-038-039', similarity: 0.7515 },
            { filename: '002080BR0215', similarity: 0.7506 },
            { filename: '001ANV022024', similarity: 0.7461 },
            { filename: '007A5P3F13-036', similarity: 0.7412 },
            { filename: 'CJHF1007', similarity: 0.7399 },
            { filename: '007A5P3F13-035', similarity: 0.735 },
            { filename: 'CJHF3003', similarity: 0.7348 },
            { filename: '0071824cx036a-09', similarity: 0.7347 },
            { filename: '001ALA011008', similarity: 0.7345 },
            { filename: '001AMF015002', similarity: 0.733 },
            { filename: '007A5P4F05-070a072', similarity: 0.7317 },
            { filename: '007A5P4F05-043', similarity: 0.7315 },
            { filename: '0071824cx045-04', similarity: 0.7267 },
            { filename: '001ALA011005', similarity: 0.7267 },
            { filename: '001MF003001', similarity: 0.7181 },
            { filename: '007A5P3F13-022', similarity: 0.7181 }
          ]
        },
        {
          _id: '001AAN005149',
          fileName: '001AAN005149.json',
          neighbors: [
            { filename: '001AAN005149', similarity: 1 },
            { filename: '001AAN005147', similarity: 0.8897 },
            { filename: '0071824cx036a-09', similarity: 0.8487 },
            { filename: '0071824cx001-09', similarity: 0.8454 },
            { filename: '001AN01002019', similarity: 0.8417 },
            { filename: '001AN01002021', similarity: 0.8312 },
            { filename: '002080RJ2202', similarity: 0.8267 },
            { filename: '007SN-02', similarity: 0.8265 },
            { filename: '001AN01001005', similarity: 0.8251 },
            { filename: '001AN01002020', similarity: 0.8226 },
            { filename: '007A6P3F03-045', similarity: 0.8224 },
            { filename: '007A5P4F05-038-039', similarity: 0.8172 },
            { filename: '007A5P3F13-036', similarity: 0.8131 },
            { filename: '007A5P4F05-070a072', similarity: 0.7944 },
            { filename: '002080RJ0103', similarity: 0.7914 },
            { filename: '007A5P4F05-043', similarity: 0.788 },
            { filename: '001MF003001', similarity: 0.7822 },
            { filename: 'P002SAm52-0054', similarity: 0.7801 },
            { filename: '0071824cx017a-04', similarity: 0.7741 },
            { filename: '001ALA011005', similarity: 0.772 },
            { filename: '007A5P3F13-022', similarity: 0.7687 },
            { filename: '0071824cx045-04', similarity: 0.7678 },
            { filename: '007A6P4FP15-010', similarity: 0.7668 },
            { filename: 'CJHF3003', similarity: 0.7653 },
            { filename: '002080BR0215', similarity: 0.7643 },
            { filename: '0071824cx036a-04', similarity: 0.7639 },
            { filename: '001ANV022024', similarity: 0.7636 },
            { filename: '0071824cx036a-02', similarity: 0.7606 },
            { filename: '001MF008', similarity: 0.7601 },
            { filename: 'CJHF1007', similarity: 0.7588 }
          ]
        }
      ]
    }
  },
  async asyncData({ route }) {
    console.log('parametros são:', route.query)
    const { similarity } = route.query
    const { data } = await axios.get(
      `http://localhost:3000/api/?similarity=${similarity}`
    )
    return { images: data }
  },
  methods: {
    copyImagesIdToClipboard(img) {
      // console.log(img)
      let ids = []
      const neighbors = _.filter(img.neighbors, { isSamePhoto: true })

      ids.push(img._id)

      neighbors.forEach(element => {
        ids.push(element.filename)
      })

      console.log(ids)
      navigator.clipboard.writeText(ids)
      this.$message({
        duration: 1500,
        message: `Id(s) copiados para o clipboard.`
      })
    },
    async updateImageState(imageToUpdate) {
      const id = imageToUpdate._id

      // try to find item index
      const imageIndex = _.findIndex(this.images, { _id: id })
      // if index, it updates in data
      if (imageIndex !== -1) {
        this.images.splice(imageIndex, 1, imageToUpdate)
      }

      const res = await axios.post(
        `http://localhost:3000/api/${id}`,
        imageToUpdate
      )

      const similarity = 0.89
      const { data } = await axios.get(
        `http://localhost:3000/api/?similarity=${similarity}?found=false`
      )

      this.images = data
    },
    //takes the photo, index and id of the similar photo and updates the db.
    async selectSimilar(photo, similarIndex, similarId) {
      const markImageAsSame = async (item, index) => {
        let arr = item.neighbors

        if (arr[index].isSamePhoto) {
          arr[index].isSamePhoto = false
        } else {
          arr[index].isSamePhoto = true
        }

        let payload = {
          ...item,
          arr
        }

        this.updateImageState(payload)
      }

      const markImageAsfound = image => {
        if (image.found) {
          image.found = false
        } else {
          image.found = true
        }

        this.updateImageState(image)
      }

      const res = await axios.get(`http://localhost:3000/api/${similarId}`)
      const similarPhoto = res.data[0]

      const indexPhoto = _.findIndex(similarPhoto.neighbors, {
        filename: photo._id
      })

      // It updates the photo and find the similar item to update it too.
      markImageAsSame(photo, similarIndex)
      markImageAsSame(similarPhoto, indexPhoto)
      markImageAsfound(similarPhoto)

      // Marc the similar item as found.

      //  TODO:
      //  Considerar marcar itens como 'founded' pq assim eles podem desaparecer da db.
      //  considerar tbm não mostrar itens que tem algum item identico dentro dos neighbors, pq eles tbm podem desaparecer da busca
      //  só é preciso marcar as relações de semelhança uma vez, depois disso eu posso apagar os itens repetidos.

      // console.log('procurando da foto:')
      // console.log(similarPhoto)
      // console.log('o index da foto mãe:', photo._id, 'que é:', indexPhoto)
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.similars {
  display: flex;
}

.photo-card {
  display: flex;
  flex-direction: row;
  margin: 40px;
  color: #eaeaea;
}
.photo-item {
  margin: 20px;
  cursor: pointer;
}
.photo {
  height: 300px;
}

.active {
  outline: 3px solid #49bd79;
}
.img-menu {
  display: flex;
  justify-content: space-between;
}
.el-button-group {
  opacity: 0.3;
}
.el-button-group:hover {
  opacity: 1;
}
</style>
