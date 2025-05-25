// 测试 daily-records API
console.log('Testing daily-records API...')

// 测试获取记录列表
fetch('http://localhost:3000/api/daily-records')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Daily Records GET:', data.success ? 'Working' : 'Error')
        if (!data.success) {
            console.error('Daily Records error:', data)
        } else {
            console.log('Records count:', data.data?.length || 0)
        }
    })
    .catch(error => {
        console.error('❌ Daily Records API failed:', error)
    })

// 测试带分页参数的获取
fetch('http://localhost:3000/api/daily-records?from=0&to=10')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Daily Records with pagination:', data.success ? 'Working' : 'Error')
        if (!data.success) {
            console.error('Pagination error:', data)
        }
    })
    .catch(error => {
        console.error('❌ Daily Records pagination failed:', error)
    })

// 测试特定日期查询
const today = new Date().toISOString().split('T')[0]
fetch(`http://localhost:3000/api/daily-records/${today}`)
    .then(response => response.json())
    .then(data => {
        console.log('✅ Daily Record by date:', data.success ? 'Working' : 'Error')
        if (data.success) {
            console.log('Today record exists:', !!data.data)
        }
    })
    .catch(error => {
        console.error('❌ Daily Record by date failed:', error)
    })

console.log('Daily Records API tests completed!') 