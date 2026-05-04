import { useState, useCallback, useRef } from "react"

const isComplete = (pin) => {
  if (/^\d{6}$/.test(pin)) return true
  if (/^\d{5}$/.test(pin)) return true
  if (/^\d{4}$/.test(pin)) return true
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(pin)) return true
  return false
}

const usePincode = (setForm, setErrors) => {
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeError, setPincodeError] = useState("")
  const debounceRef = useRef(null)

  const handlePincodeChange = useCallback((e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, pincode: value }))
    setPincodeError("")
    if (setErrors) setErrors(prev => ({ ...prev, pincode: "" }))
    setPincodeLoading(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    if (!isComplete(trimmed)) return

    setPincodeLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pincode/${trimmed}`)
        const data = await res.json()
        if (data.success) {
          setForm(prev => ({
            ...prev,
            city: data.city || prev.city,
            state: data.state || prev.state,
            country: data.country || prev.country,
          }))
          setPincodeError("")
        } else {
          setPincodeError("Pincode not found")
        }
      } catch {
        setPincodeError("Pincode not found")
      }
      setPincodeLoading(false)
    }, 400)
  }, [setForm, setErrors])

  return { pincodeLoading, pincodeError, handlePincodeChange }
}

export default usePincode
