// 简单的API测试脚本
console.log('Testing API endpoints...')

// 测试奖励API
fetch('http://localhost:3000/api/rewards')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Rewards API:', data.success ? 'Working' : 'Error')
        if (!data.success) {
            console.error('Rewards error:', data)
        }
    })
    .catch(error => {
        console.error('❌ Rewards API failed:', error)
    })

// 测试任务API
fetch('http://localhost:3000/api/tasks')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Tasks API:', data.success ? 'Working' : 'Error')
        if (!data.success) {
            console.error('Tasks error:', data)
        }
    })
    .catch(error => {
        console.error('❌ Tasks API failed:', error)
    })

// 测试儿童状态API
fetch('http://localhost:3000/api/child-status')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Child Status API:', data.success ? 'Working' : 'Error')
        if (!data.success) {
            console.error('Child Status error:', data)
        }
    })
    .catch(error => {
        console.error('❌ Child Status API failed:', error)
    })

console.log('API tests completed!') 