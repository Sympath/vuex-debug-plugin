<script>
// import genFormItem from './gen.js';
export default {
  name: 'config-table',
  d_name: 'we-table-dynamic',
  props: {
    loading: {
      type: Boolean,
      default: () => false
    },
    tableProps: { // 对应El-Table Attributes
      required: true,
      type: Object
    },
    list: {
      required: true,
      type: Array,
      default: () => []
    },
    columns: { // 对应El-Table-column Attributes
      required: true,
      type: Array,
      default: () => []
    },
  },
  render(h) {
    const render = (h, data) => {
      data = Array.isArray(data) ? data : [data]
      return data.map(col => {
        const { children } = col
        const props = {
          ...col
        }
        // 特殊处理
        const hasChildren = Array.isArray(children) && children.length;
        const hasCellRender = typeof col.renderCell === 'function';
        let cS = []
        if (hasChildren) {
          cS = render(h, children)
        }
        const colProps = {
          props
        }
        if (hasCellRender) {
          colProps.scopedSlots = {
            default(ps) {
              let renderTarget = col.renderCell(h, ps);
              return renderTarget // 通过renderCell，支持scopedSlots
             
            }
          }
        }
        return h('el-table-column', colProps, hasChildren ? cS : []) // 通过children属性，支持多级表头
      })
    }
    return h('el-table', {
      class: 'config-table',
      props: {
        ...this.tableProps,
        data:this.list
      },
      on: {
        ...this.$listeners // 支持El-Table 原有所有Events
      },
      directives: [
        {
          name: 'loading',
          value: this.loading // 支持loading
        }
      ],
      ref: 'ref', // 通过这个ref，对应El-Table Methods
    }, render(h, this.columns).concat(h('template', { slot: 'append' },this.$slots.append))) // 支持El-Table slot append
  }
}
</script>
