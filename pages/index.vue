<template>
  <div class="container">
    <div class="photo-card" v-for="photo in images" :key="photo._id">
      <div class="button-group">
        <!-- <el-tooltip
          class="item"
          effect="dark"
          content="Marcar imagem como resolvida."
          placement="right-start"
        >
          <el-button
            @click="markImageAsRevised(photo)"
            :type="photo.revised ? 'success' : ''"
            icon="el-icon-check"
            circle
          ></el-button>
        </el-tooltip> -->
        <el-tooltip
          class="item"
          effect="dark"
          content="Copiar id(s) para o clipboard."
          placement="right-start"
        >
          <el-button
            type="primary"
            icon="el-icon-copy-document"
            @click="copyImagesIdToClipboard(photo)"
            circle
          ></el-button>
        </el-tooltip>
      </div>
      <div class="photo-item">
        <img class="photo" :src="`/photos/${photo._id}.jpg`" alt>
        <div class="img-menu">
          <p>id: {{photo._id}}</p>
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
      `http://192.168.1.254:3333/api/?similarity=${similarity}`
    )
    return { images: data }
  },
  methods: {
    markImageAsRevised(image) {
      if (image.revised) {
        image.revised = false
      } else {
        image.revised = true
      }
      this.updateImageState(image)
    },
    copyImagesIdToClipboard(img) {
      let ids = []
      const neighbors = _.filter(img.neighbors, { isSamePhoto: true })

      ids.push(img._id)

      neighbors.forEach(element => {
        ids.push(element.filename)
      })

      function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement('textarea')

        textArea.style.position = 'fixed'
        textArea.style.top = 0
        textArea.style.left = 0

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em'
        textArea.style.height = '2em'

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0

        // Clean up any borders.
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent'
        const t = text.toString().replace(/,/g, ';')
        textArea.value = t
        console.log('texto é ', t)
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          var successful = document.execCommand('copy')
          var msg = successful ? 'successful' : 'unsuccessful'
          console.log('Fallback: Copying text command was ' + msg)
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err)
        }

        document.body.removeChild(textArea)
      }

      fallbackCopyTextToClipboard(ids)

      this.$message({
        duration: 1500,
        message: `Id(s) copiados para o clipboard.`
      })
    },
    async updateImageState(imageToUpdate) {
      const id = imageToUpdate._id

      const res = await axios.post(
        `http://192.168.1.254:3333/api/${id}`,
        imageToUpdate
      )

      const similarity = this.$route.query.similarity
        ? this.$route.query.similarity
        : 0.89
      const { data } = await axios.get(
        `http://192.168.1.254:3333/api/?similarity=${similarity}?found=false`
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

      const res = await axios.get(`http://192.168.1.254:3333/api/${similarId}`)
      const similarPhoto = res.data[0]

      const indexPhoto = _.findIndex(similarPhoto.neighbors, {
        filename: photo._id
      })

      // It updates the photo and find the similar item to update it too.
      markImageAsSame(photo, similarIndex)
      markImageAsSame(similarPhoto, indexPhoto)
      markImageAsfound(similarPhoto)

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
  margin-left: 20px;
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

.button-group {
  text-align: center;
}

.el-button {
  margin: 10px 0px !important;
}
.button-group:hover {
  opacity: 1;
}
.el-checkbox {
  /* margin: 10 !important; */
}
</style>
