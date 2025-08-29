import { guid } from '@/common/tool'
import { gcj02towgs84 } from 'coordtransform'
import { cars, units } from './data'
import * as turf from '@turf/turf'
import dayjs from 'dayjs'

self.onmessage = function(e) {
    const { poiList } = e.data
    const arr = poiList.reduce((prev, item) => {
        const { time, carName, unitId, start, end, result } = item
        const resultWgs84 = result.map(coor => {
        const [longitude, latitude] = coor
        return gcj02towgs84(longitude, latitude)
        })
        
        for (const i in resultWgs84) {
        const coor = resultWgs84[i]
        const [longitude, latitude] = coor
        const prevPath = resultWgs84.slice(0, i)
        const line = {
            type: 'LineString',
            coordinates: prevPath,
        }
        const length = turf.length(line, { units: 'kilometers' })
        const checkTime = dayjs(time).add(length / 40, 'hour').format('YYYY-MM-DD HH:mm:ss')
        const id = guid()
        const sql = `('${id}', '${units[unitId]}', '${cars[carName]?.code}', '${longitude}', '${latitude}', 0, '${cars[carName]?.id}', 0, '0', '${checkTime}', '${checkTime}', '${checkTime}', '')`
        prev.push(sql)
        }
        return prev
    }, [])
    
    const resultText = `INSERT INTO mhpis.ds_checkdata_no_task
(id, unit_id, machine_code, longx, laty, distance, emp_id, speed, over_flag, checktime, checkdate, uploadtime, user_id) VALUES
${arr.join(',\n')}`
    // 将结果发送回主线程
    self.postMessage(resultText)
}