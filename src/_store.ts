import { DataForStoreType } from '.'

let data: DataForStoreType

export default {
  set(storeData: DataForStoreType) {
    data = {
      ...storeData,
      namespaces: {
        ...(data?.namespaces || {}),
        ...(storeData?.namespaces || {}),
      },
    }
  },
  get(): DataForStoreType {
    return data
  },
}
