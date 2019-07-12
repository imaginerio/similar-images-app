<template>
  <div>
    <el-header>
      <div @click="forceNavigation('/?similarity=0.89')">
        <img class="icons" src="/home.svg" alt />
      </div>
      <div class="search" v-on:keyup.enter="searchRecords">
        <el-input
          placeholder="Record Name para busca"
          v-model="searchBox"
          v-on:keyup.enter="searchRecords"
          class="input-with-select"
        ></el-input>
      </div>
    </el-header>
    <div class="container">
      <div
        class="photo-card"
        v-for="photo in images"
        :key="photo._id"
        :id="photo._id"
        v-show="showFoundImage(photo)"
      >
        <div class="button-group">
          <el-tooltip
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
          </el-tooltip>
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
          <img class="photo" :src="`/photos/${photo._id}.jpg`" alt />
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
            />
            <div class="img-menu">
              <p>{{similar.filename}}</p>
              <p>Similarity: {{similar.similarity * 100}}%</p>
            </div>
          </div>
        </div>
      </div>
      <infinite-loading @infinite="infiniteHandler"></infinite-loading>
    </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'
import axios from 'axios'
import _ from 'lodash'

const api = 'http://192.168.1.254:3333/api/'
export default {
  components: {
    Logo
  },
  data() {
    return {
      loading: false,
      page: 1,
      searchBox: '',
      similarity: 89
    }
  },
  async asyncData({ route }) {
    const { data } = await axios.get(api, {
      params: route.query
    })
    return { images: data }
  },
  methods: {
    //TODO:
    // Substituir essa lógica para usar 'found' ao invés de considerar o search
    showFoundImage(img) {
      const { search } = this.$route.query
      if (search) {
        return true
      } else {
        return !img.found || img.revised
      }
    },
    infiniteHandler($state) {
      this.loading = true
      const query = { ...this.$route.query, page: this.page + 1 }
      axios
        .get(api, {
          params: query
        })
        .then(({ data }) => {
          if (data.length) {
            this.loading = false
            this.$router.push({ path: '/', query: query })
            this.page += 1
            this.images.push(...data)
            $state.loaded()
          } else {
            this.loading = false
            $state.complete()
          }
        })
    },
    forceNavigation(to) {
      window.location.href = to
    },
    async searchRecords() {
      window.location.href = `/?search=${this.searchBox}`
    },
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

      const res = await axios.post(api + id, imageToUpdate)

      const { data } = await axios.get(api, {
        params: this.$route.query
      })

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
  },
  created() {
    const { page } = this.$route.query
    page ? (this.page = parseFloat(page)) : (this.page = 1)
    // console.log(this.$route.query)
  }
}
</script>

<style>
.container {
  margin: 60px auto;
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
.el-header {
  /* background-color: #b3c0d1; */
  background-color: rgb(43, 42, 42);
  color: #333;
  line-height: 60px;
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  padding-left: 83px;
}
.search {
  width: 400px;
  height: 20px;
}
.el-input__inner {
  -webkit-appearance: none;
  background-color: #272727;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #4b4b4d9c;
  border-bottom: 1px solid #9293979c;
  box-sizing: border-box;
  color: #e9e9e9;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
.el-input__inner:hover {
  border: 1px solid #4b4b4d9c;
  border-bottom: 1px solid #9293979c;
}
.icons {
  color: blanchedalmond;
  height: 32px;
  margin: 14px;
  fill: currentColor;
  cursor: pointer;
}
.loadMoreItensBtn {
  width: 300px;
  align-self: center;
}
</style>
