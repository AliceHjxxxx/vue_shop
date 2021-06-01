<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20"
        ><el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList()"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4"
          ><el-button type="primary" @click="goAddPage()"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <!-- table表格区域 -->
      <el-row>
        <el-table :data="goodslist" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column
            label="商品价格(元)"
            prop="goods_price"
            width="95px"
          ></el-table-column>
          <el-table-column
            width="70px"
            label="商品重量"
            prop="goods_weight"
          ></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="140px"
            ><template slot-scope="scope">
              {{ scope.row.add_time | dataFormat }}</template
            >
          </el-table-column>
          <el-table-column label="操作" width="200px">
            <template slot-scope="scope"
              ><el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.goods_id)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeGoodsById(scope.row.goods_id)"
                >删除</el-button
              ></template
            >
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
        >
        </el-pagination>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodslist: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败")
      }
      // this.$message.success("获取商品列表成功")
      // 把数据列表赋值给catelist
      this.goodslist = res.data.goods

      this.total = res.data.total
      console.log(this.total)
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err)
      // 如果用户取消了确认，则返回值为字符串comfirm
      // 如果用户取消了删除，则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除")
      }
      console.log("确认了删除")
      const { data: res } = await this.$http.delete("goods/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败！")
      }
      this.$message.success("删除商品成功！")
      this.getGoodsList()
    },
    goAddPage() {
      this.$router.push("./goods/add")
    }
  }
}
</script>
<style lang="less" scope></style>
