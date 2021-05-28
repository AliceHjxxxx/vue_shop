<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog()"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!--排序  -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            autofocus
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateDialogClosed()"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- option用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentsCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="40%"
      @close="editCateDialogClosed()"
    >
      <!-- 修改分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      // 总数据条数
      total: 0,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类的表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 指定级联选择器的配置对象
      editCateForm: [],
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },

      cascaderProps: {
        // 选中的值
        value: "cat_id",
        // 看重的名称
        label: "cat_name",
        // 嵌套的选项
        children: "children"
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 为table指定列的定义
      columns: [
        { label: "分类名称", prop: "cat_name" },
        {
          label: "是否有效",
          // 是否将当前页定义为模板列
          type: "template",
          // 表示当前页使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          // 是否将当前页定义为模板列
          type: "template",
          // 表示当前页使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          // 是否将当前页定义为模板列
          type: "template",
          // 表示当前页使用的模板名称
          template: "opt"
        }
      ]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分页数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败")
      }
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()

      this.addCateDialogVisible = true
      // console.log(this.parentsCateList)
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！")
      }
      this.parentCateList = res.data
    },

    // 选择项发生变化出发的这个函数
    parentsCateChanged() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    async addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
          // 发起修改用户信息的数据请求
        }
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error("创建分类失败！")
        }
        this.$message.success("创建分类成功！")
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    async removeCateById(id) {
      console.log(id)
      const confirmResult = await this.$confirm(
        "此操作将删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除")
      }
      console.log("确认了删除")
      const { data: res } = await this.$http.delete("categories/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败")
      }
      this.$message.success("删除分类成功")
      this.getCateList()
    },
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get("categories/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类信息失败")
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return
          // 发起修改用户信息的数据请求
        }
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          this.editCateForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error("修改信息失败")
        }
        this.$message.success("修改信息成功")
        this.editCateDialogVisible = false
        this.getCateList()
      })
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
