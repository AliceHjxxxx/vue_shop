<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row
        ><el-button type="primary" @click="addRolesDialogVisible = true"
          >添加角色</el-button
        ></el-row
      >
      <el-table :data="roleslist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5"
                ><el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i
              ></el-col>

              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <!-- 通过For循环渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    ></el-col
                  ></el-row
                >
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRolesDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table></el-card
    >
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClose"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRolesFormDialogVisible"
      width="50%"
      @click="editRoleDialogClosed()"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesFormInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightDialogClosed()"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleslist: [],
      addRolesDialogVisible: false,
      addRolesForm: { roleName: "", roleDesc: "" },
      addRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 5,
            message: "角色名长度在 3 到 5 个字符",
            trigger: "blur"
          }
        ]
      },
      editRolesForm: {},
      editRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 5,
            message: "角色名长度在 3 到 5 个字符",
            trigger: "blur"
          }
        ]
      },
      editRolesFormDialogVisible: false,
      // 控制权限对话框的显示与隐藏
      setRightsDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: { label: "authName", children: "children" },
      //默认选中的权限Id的值
      defKeys: [105],
      roleId: ""
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }
      this.roleslist = res.data
      //   console.log(this.roleslist)
    },
    addRolesDialogClose() {
      this.$refs.addRolesFormRef.resetFields()
    },
    async addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 可以添加网络的预校验请求
        const { data: res } = await this.$http.post("roles", this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error("创建角色失败")
        }
        this.$message.success("创建角色成功")
        this.addRolesDialogVisible = false
        this.getRolesList()
      })
    },
    async removeRolesById(id) {
      //   console.log(id)
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将删除该角色, 是否继续?",
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
      const { data: res } = await this.$http.delete("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败")
      }
      this.$message.success("删除角色成功")
      this.getRolesList()
    },
    editRoleDialogClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 展示编辑角色的对话框
    async showEditRolesDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败")
      }
      this.editRolesForm = res.data
      //   console.log(this.editRolesForm.roleId)
      this.editRolesFormDialogVisible = true
    },
    editRolesFormInfo() {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) {
          return
          // 发起修改用户信息的数据请求
        }
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户信息失败")
        }
        this.$message.success("修改用户信息成功")
        this.editRolesFormDialogVisible = false
        this.getRolesList()
      })
    },
    // 根据ID删除对应权限
    async removeRightById(role, rightid) {
      console.log(rightid)
      const confirmResult = await this.$confirm(
        "此操作将删除该角色权限, 是否继续?",
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
      //   console.log("确认了删除")
      const { data: res } = await this.$http.delete(
        "roles/" + role.id + "/rights/" + rightid
      )
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色权限失败")
      }
      this.$message.success("删除角色权限成功")
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightsDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree")
      if (res.meta.status !== 200) {
        return this.$message.error("获取所有角色权限失败")
      }
      this.rightsList = res.data

      // 获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      console.log(role)
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式获取角色下所有三级权限
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
      this.getRolesList()
    },
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(",")
      console.log(idStr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error("分配角色权限失败")
      }
      this.$message.success("分配角色权限成功")
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
