<template>
  <!-- 面包屑导航 -->
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addForm.goods_weight"
                type="number"
              ></el-input> </el-form-item
            ><el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catelist"
                v-model="addForm.goods_cat"
                :props="cateProps"
                @change="handleChange"
              >
              </el-cascader></el-form-item
          ></el-tab-pane>

          <el-tab-pane label="商品参数" name="1"
            ><!-- 渲染表单item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3"
            ><el-form-item>
              <!-- action表示图片要上传到得图片API地址 -->
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="heardersObj"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">
                  只能上传jpg/png文件，且不超过500kb
                </div>
              </el-upload>
            </el-form-item></el-tab-pane
          >
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="subAdd()"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs></el-form
      >
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="提示" :visible.sync="previewVisible" width="40%">
      <img :src="previewPath" class="prevImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash"
export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 商品所属的分类数组
        goods_cat: [],
        pics: [],
        previewPath: "",
        goods_introduce: "",
        attrs: []
      },
      addFormrules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ]
      },
      catelist: [],

      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      manyTableData: [],
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传得请求头
      heardersObj: { Authorization: window.sessionStorage.getItem("token") },
      previewVisible: false,
      previewPath: ""
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败")
      }
      // 把数据列表赋值给catelist
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项变化会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将离开标签页得名字是" + activeName)
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类!")
        return false
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === "1") {
        console.log("动态参数面板")
        const { data: res } = await this.$http.get(
          `categories/ ${this.cateId} /attributes`,
          {
            params: { sel: "many" }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败")
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ")
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/ ${this.cateId} /attributes`,
          {
            params: { sel: "only" }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败")
        }
        // console.log(res.data)
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // 处理图片预览事件
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    // 监听图片上传成功的事件
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    // 处理图片移除事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    subAdd() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要得表单项")
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(",")
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          }

          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        console.log(form)
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post("goods", form)
        if (res.meta.status !== 201) {
          console.log(res.meta)
          return this.$message.error("添加商品失败！")
        }
        this.$message.success("添加商品成功！")
        this.$router.push("/goods")
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.prevImg {
  width: 100%;
}
</style>
